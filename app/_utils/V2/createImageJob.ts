import { createPendingJob } from '../pendingUtils'
import { sleep } from '../sleep'
import { hasPromptMatrix, promptMatrix } from '../promptUtils'
import { DEFAULT_SAMPLER_ARRAY } from '_constants'
import CreateImageRequest from 'app/_data-models/CreateImageRequest'

const cleanMultiInputString = (multiString: string) => {
  if (Array.isArray(multiString)) {
    return multiString.map((value: string) => {
      return Number(value)
    })
  }

  let cleanMultiString = multiString.replace(`"`, '')
  cleanMultiString = cleanMultiString.replace(`'`, '')

  return cleanMultiString.split(',').map((value: string) => {
    return Number(value)
  })
}

const handleMulti = (
  newImageRequest: CreateImageRequest,
  field: keyof CreateImageRequest,
  fieldName: string
): CreateImageRequest[] => {
  const tempArray = []
  const multiValues = cleanMultiInputString(newImageRequest[field])
  for (const value of multiValues) {
    const imageRequest: CreateImageRequest = {
      ...newImageRequest,
      [fieldName]: value
    }
    tempArray.push(imageRequest)
  }
  return tempArray
}

const handleMultiSampler = (
  newImageRequest: CreateImageRequest
): CreateImageRequest[] => {
  let samplerArray: string[] = []

  if (newImageRequest.useMultiSamplers) {
    samplerArray = [...newImageRequest.multiSamplers]
  } else {
    samplerArray = [...DEFAULT_SAMPLER_ARRAY]
  }

  if (newImageRequest.models[0] === 'stable_diffusion_2') {
    samplerArray = ['dpmsolver']
  }

  return samplerArray.map((sampler) => {
    return { ...newImageRequest, numImages: 1, sampler: sampler }
  })
}

const handlePromptMatrix = (
  newImageRequest: CreateImageRequest
): CreateImageRequest[] => {
  const matrixPrompts = [...promptMatrix(newImageRequest.prompt)]
  const matrixNegative = [...promptMatrix(newImageRequest.negative)]

  const tempArray: CreateImageRequest[] = []

  if (matrixPrompts.length >= 1 && matrixNegative.length === 0) {
    for (const prompt of matrixPrompts) {
      tempArray.push({ ...newImageRequest, prompt: prompt })
    }
  } else if (matrixPrompts.length === 0 && matrixNegative.length >= 1) {
    for (const negative of matrixNegative) {
      tempArray.push({ ...newImageRequest, negative: negative })
    }
  } else if (matrixPrompts.length >= 1 && matrixNegative.length >= 1) {
    for (const prompt of matrixPrompts) {
      for (const negative of matrixNegative) {
        tempArray.push({
          ...newImageRequest,
          prompt: prompt,
          negative: negative
        })
      }
    }
  }

  return tempArray
}

const isValidMulti = (
  newImageRequest: CreateImageRequest,
  useMultiField: keyof CreateImageRequest,
  fieldName: keyof CreateImageRequest
): boolean => {
  return (
    newImageRequest[useMultiField] &&
    newImageRequest[fieldName] &&
    newImageRequest[fieldName].length > 0
  )
}

const mergePendingJobArray = (
  existingArray: CreateImageRequest[],
  newItems: CreateImageRequest[],
  fieldsToOverwrite: string[]
): CreateImageRequest[] => {
  const newArray = []
  if (existingArray.length > 0) {
    for (const existingItem of existingArray) {
      for (const newItem of newItems) {
        const mergedItem = {
          ...existingItem,
          ...Object.fromEntries(
            // @ts-ignore
            fieldsToOverwrite.map((field) => [field, newItem[field]])
          )
        }
        newArray.push(mergedItem)
      }
    }
  } else {
    newArray.push(...newItems)
  }
  return newArray
}

export const createImageJob = async (
  newImageRequest: CreateImageRequest
): Promise<{
  status?: string
  success: boolean
  pendingJobArray: CreateImageRequest[]
}> => {
  let pendingJobArray: CreateImageRequest[] = []

  // Handle all multi-job requests first and split them apart
  // into individual pending requests that can be handled as needed.
  if (newImageRequest.useMultiClip && newImageRequest.multiClip.length > 0) {
    pendingJobArray = mergePendingJobArray(
      pendingJobArray,
      handleMulti(newImageRequest, 'multiClip', 'clipskip'),
      ['clipskip']
    )
  }

  if (isValidMulti(newImageRequest, 'useMultiGuidance', 'multiGuidance')) {
    pendingJobArray = mergePendingJobArray(
      pendingJobArray,
      handleMulti(newImageRequest, 'multiGuidance', 'cfg_scale'),
      ['cfg_scale']
    )
  }

  if (isValidMulti(newImageRequest, 'useMultiSteps', 'multiSteps')) {
    pendingJobArray = mergePendingJobArray(
      pendingJobArray,
      handleMulti(newImageRequest, 'multiSteps', 'steps'),
      ['steps']
    )
  }

  if (
    isValidMulti(newImageRequest, 'useMultiDenoise', 'multiDenoise') &&
    newImageRequest.source_image
  ) {
    pendingJobArray = mergePendingJobArray(
      pendingJobArray,
      handleMulti(newImageRequest, 'multiDenoise', 'denoising_strength'),
      ['denoising_strength']
    )
  }

  if (newImageRequest.useAllSamplers) {
    pendingJobArray = mergePendingJobArray(
      pendingJobArray,
      handleMultiSampler(newImageRequest),
      ['sampler']
    )
  }

  if (newImageRequest.useMultiSamplers) {
    pendingJobArray = mergePendingJobArray(
      pendingJobArray,
      handleMultiSampler(newImageRequest),
      ['sampler']
    )
  }

  if (
    hasPromptMatrix(newImageRequest.prompt) ||
    hasPromptMatrix(newImageRequest.negative)
  ) {
    pendingJobArray = mergePendingJobArray(
      pendingJobArray,
      handlePromptMatrix(newImageRequest),
      ['prompt', 'negative']
    )
  }

  // Now start processing pending job requests
  // an casting data to proper type
  try {
    if (pendingJobArray.length === 0) {
      // @ts-ignore
      await createPendingJob(newImageRequest)
    } else {
      const jobs = pendingJobArray.map((job) =>
        // @ts-ignore
        createPendingJob(job)
      )
      await Promise.all(jobs)
      await sleep(100) // Assuming a delay is still needed between job creations
    }

    return { success: true, pendingJobArray }
  } catch (error) {
    return { success: false, status: 'error', pendingJobArray: [] }
  }
}
