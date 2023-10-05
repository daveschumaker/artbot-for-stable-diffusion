import { createPendingJob } from '../pendingUtils'
import { sleep } from '../sleep'
import { hasPromptMatrix, promptMatrix } from '../promptUtils'
import { DEFAULT_SAMPLER_ARRAY } from '_constants'
import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'

interface ImageRequest extends DefaultPromptInput {
  // additional fields if any
}

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
  newImageRequest: DefaultPromptInput,
  field: keyof DefaultPromptInput,
  fieldName: string
): ImageRequest[] => {
  const tempArray = []
  const multiValues = cleanMultiInputString(newImageRequest[field])
  for (const value of multiValues) {
    const imageRequest: ImageRequest = {
      ...newImageRequest,
      [fieldName]: value
    }
    tempArray.push(imageRequest)
  }
  return tempArray
}

const handleMultiSampler = (
  newImageRequest: DefaultPromptInput
): ImageRequest[] => {
  let samplerArray: string[] = [...DEFAULT_SAMPLER_ARRAY]

  if (newImageRequest.models[0] === 'stable_diffusion_2') {
    samplerArray = ['dpmsolver']
  }

  return samplerArray.map((sampler) => {
    return { ...newImageRequest, numImages: 1, sampler: sampler }
  })
}

const handlePromptMatrix = (
  newImageRequest: DefaultPromptInput
): ImageRequest[] => {
  const matrixPrompts = [...promptMatrix(newImageRequest.prompt)]
  const matrixNegative = [...promptMatrix(newImageRequest.negative)]

  const tempArray: ImageRequest[] = []

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
  newImageRequest: DefaultPromptInput,
  useMultiField: keyof DefaultPromptInput,
  fieldName: keyof DefaultPromptInput
): boolean => {
  return (
    newImageRequest[useMultiField] &&
    newImageRequest[fieldName] &&
    newImageRequest[fieldName].length > 0
  )
}

const mergePendingJobArray = (
  existingArray: ImageRequest[],
  newItems: ImageRequest[],
  fieldsToOverwrite: string[]
): ImageRequest[] => {
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
  newImageRequest: DefaultPromptInput
): Promise<{
  status?: string
  success: boolean
  pendingJobArray: ImageRequest[]
}> => {
  let pendingJobArray: ImageRequest[] = []

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

  try {
    if (pendingJobArray.length === 0) {
      // @ts-ignore
      await createPendingJob(newImageRequest as ImageRequest)
    } else {
      const jobs = pendingJobArray.map((job) =>
        // @ts-ignore
        createPendingJob(job as ImageRequest)
      )
      await Promise.all(jobs)
      await sleep(100) // Assuming a delay is still needed between job creations
    }

    return { success: true, pendingJobArray }
  } catch (error) {
    return { success: false, status: 'error', pendingJobArray: [] }
  }
}
