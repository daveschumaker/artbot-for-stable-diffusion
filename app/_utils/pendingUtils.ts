import { MAX_IMAGES_PER_JOB } from '_constants'
import CreateImageRequest from 'app/_data-models/CreateImageRequest'
import { logError, uuidv4 } from './appUtils'
import { getModelVersion, validModelsArray } from './modelUtils'
import { modelStore } from 'app/_store/modelStore'
import { SourceProcessing } from './promptUtils'
import { userInfoStore } from 'app/_store/userStore'
import { toast, ToastOptions } from 'react-toastify'
import { logToConsole } from './debugTools'
import {
  deletePendingJob,
  setPendingJob
} from 'app/_controllers/pendingJobsCache'
import AppSettings from 'app/_data-models/AppSettings'
import { addPendingJobToDexie } from './db'

export const addPendingJobToDexieDb = async (
  imageParams: CreateImageRequest
) => {
  // Create a temporary uuid for easier lookups.
  // Will be replaced later when job is accepted
  // by API
  imageParams.jobId = uuidv4()

  try {
    const imageId = await addPendingJobToDexie(imageParams)
    setPendingJob(Object.assign({}, imageParams, { id: imageId }))
    return {
      success: true
    }
  } catch (err) {
    console.log(`Error: Unable to add pending job.`)
    console.log(err)

    return {
      success: false
    }
  }
}

const cloneImageParams = async (imageParams: CreateImageRequest) => {
  const clonedParams = Object.assign({}, imageParams)
  clonedParams.timestamp = Date.now()

  const hasImg2ImgMask =
    clonedParams.source_processing === SourceProcessing.Img2Img &&
    clonedParams.source_mask

  const needsImg2ImgMask =
    clonedParams.source_processing === SourceProcessing.InPainting &&
    clonedParams.models &&
    clonedParams.models[0] &&
    clonedParams.models[0].indexOf('_inpainting') === -1

  // I believe this is deprecated as of ComfyUI worker upgrades?
  if (hasImg2ImgMask || needsImg2ImgMask) {
    clonedParams.source_processing = SourceProcessing.InPainting

    // TODO: Importing this causes Fabric to be built as part of
    // app chunk, doubling size of initial JS library. Find a way to split this out.
    //@ts-ignore
    // const CreateCanvas = (await import('../models/CreateCanvas')).default

    // @ts-ignore
    // clonedParams.source_mask = await CreateCanvas.invert(
    //   `data:image/webp;base64,${clonedParams.source_mask}`,
    //   true
    // )
  }

  return clonedParams
}

export const createPendingRerollJob = async (
  imageParams: CreateImageRequest
) => {
  const clonedParams = await cloneImageParams(imageParams)
  return await addPendingJobToDexieDb(clonedParams)
}

export const addTriggerToPrompt = ({
  prompt,
  model
}: {
  prompt: string
  model: string
}) => {
  let triggers = ''
  if (modelStore.state.modelDetails[model]) {
    const triggerArray = modelStore?.state?.modelDetails[model]?.trigger ?? []

    if (triggerArray.length > 0) {
      // Instead of adding all trigger words at once to prompt, randomly pick one:
      triggers = triggerArray[Math.floor(Math.random() * triggerArray.length)]
    }
  }

  if (triggers) {
    return `${triggers} ${prompt}`
  }

  return prompt
}

const toastObject: ToastOptions = {
  pauseOnFocusLoss: false,
  position: 'top-center',
  autoClose: 2500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: false,
  progress: undefined,
  theme: 'light'
}

export const addPendingJobToDb = async ({
  clonedParams,
  errorCount = 0
}: {
  clonedParams: any
  errorCount: number
}) => {
  // Handle an interesting race condition that sometimes happens with Dexie
  // "QuoteExceeded" error but not really.
  // https://dexie.org/docs/DexieErrors/Dexie.QuotaExceededError
  try {
    if (errorCount >= 5) {
      toast.error(
        'Unable to add pending image request to browser database. Please reload the web app and try again.',
        toastObject
      )
      return { success: false }
    }

    await addPendingJobToDexieDb(clonedParams)

    logToConsole({
      data: clonedParams,
      name: 'pendingUtils.addPendingJobToDb.success',
      debugKey: 'ADD_PENDING_JOB_TO_DB'
    })
  } catch (err: any) {
    errorCount++

    logToConsole({
      data: err,
      name: 'pendingUtils.addPendingJobToDb.error',
      debugKey: 'ADD_PENDING_JOB_TO_DB'
    })

    if (err.message && err.message.includes('QuotaExceededError')) {
      // Handle a strange error the happens for... some reason?
      // https://dexie.org/docs/DexieErrors/Dexie.QuotaExceededError

      logError({
        path: window.location.href,
        errorMessage: [
          'pendingUtils.addPendingJobToDb.errorCountExceeded',
          'Unable to add completed item to db'
        ].join('\n'),
        errorInfo: err?.message,
        errorType: 'client-side',
        username: userInfoStore.state.username
      })

      deletePendingJob(clonedParams.jobId)
    } else {
      logError({
        path: window.location.href,
        errorMessage: [
          'pendingUtils.addPendingJobToDb',
          'Unable to add completed item to db'
        ].join('\n'),
        errorInfo: err?.message,
        errorType: 'client-side',
        username: userInfoStore.state.username
      })

      deletePendingJob(clonedParams.jobId)
    }
  }
}

export const createPendingJob = async (imageParams: CreateImageRequest) => {
  const { prompt } = imageParams
  let { numImages = 1 } = imageParams

  if (!prompt || !prompt?.trim()) {
    return []
  }

  // Clean up any useMulti options:
  imageParams.useAllModels = false
  imageParams.useAllSamplers = false
  imageParams.useMultiClip = false
  imageParams.useMultiDenoise = false
  imageParams.useMultiGuidance = true
  imageParams.useMultiSteps = false
  imageParams.multiClip = []
  imageParams.multiDenoise = []
  imageParams.multiGuidance = []
  imageParams.multiSteps = []

  if (isNaN(numImages) || numImages < 1) {
    numImages = 1
  } else if (numImages > MAX_IMAGES_PER_JOB) {
    numImages = MAX_IMAGES_PER_JOB
  }

  let clonedParams

  if (imageParams.models.length > 1) {
    for (const model of imageParams.models) {
      clonedParams = await cloneImageParams(imageParams)
      clonedParams.models = [model]

      if (model === 'stable_diffusion_2.0') {
        clonedParams.sampler = 'dpmsolver'
      }

      try {
        for (let i = 0; i < numImages; i++) {
          if (clonedParams.models[0] === 'random') {
            clonedParams.models = [
              CreateImageRequest.getRandomModel({ imageParams: clonedParams })
            ]
          }
          clonedParams.modelVersion = getModelVersion(clonedParams.models[0])

          if (AppSettings.get('modelAutokeywords')) {
            clonedParams.prompt = addTriggerToPrompt({
              prompt,
              model: clonedParams.models[0]
            })
          }

          if (clonedParams.orientation === 'random') {
            clonedParams = {
              ...clonedParams,
              ...CreateImageRequest.getRandomOrientation()
            }
          }

          if (clonedParams.sampler === 'random') {
            clonedParams.sampler = CreateImageRequest.getRandomSampler({
              steps: clonedParams.steps,
              source_processing: clonedParams.source_processing
            })
          }

          await addPendingJobToDexieDb(clonedParams)
        }
      } catch (err) {}
    }

    return {
      success: true
    }
  }

  if (imageParams.useAllModels) {
    imageParams.numImages = 1
    const models = validModelsArray({ imageParams })

    for (const model of models) {
      const { name: modelName } = model

      // It doesn't make sense to include this in all models mode.
      if (
        modelName.indexOf('_inpainting') >= 0 ||
        modelName === 'Stable Diffusion 2 Depth'
      ) {
        return
      }

      clonedParams = await cloneImageParams(imageParams)
      clonedParams.models = [modelName]

      if (modelName === 'stable_diffusion_2.0') {
        clonedParams.sampler = 'dpmsolver'
      }

      if (clonedParams.models[0] === 'random') {
        clonedParams.models = [
          CreateImageRequest.getRandomModel({ imageParams: clonedParams })
        ]
      }
      clonedParams.modelVersion = getModelVersion(clonedParams.models[0])

      if (AppSettings.get('modelAutokeywords')) {
        clonedParams.prompt = addTriggerToPrompt({
          prompt,
          model: clonedParams.models[0]
        })
      }

      if (clonedParams.orientation === 'random') {
        clonedParams = {
          ...clonedParams,
          ...CreateImageRequest.getRandomOrientation()
        }
      }

      if (clonedParams.sampler === 'random') {
        clonedParams.sampler = CreateImageRequest.getRandomSampler({
          steps: clonedParams.steps,
          source_processing: clonedParams.source_processing
        })
      }

      await addPendingJobToDexieDb(clonedParams)
    }

    return {
      success: true
    }
  } else {
    const count = Array(Number(numImages)).fill(0)

    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    for (const _num of count) {
      clonedParams = await cloneImageParams(imageParams)
      clonedParams.modelVersion = getModelVersion(clonedParams.models[0])

      if (clonedParams.orientation === 'random') {
        clonedParams = {
          ...clonedParams,
          ...CreateImageRequest.getRandomOrientation()
        }
      }

      if (clonedParams.sampler === 'random') {
        clonedParams.sampler = CreateImageRequest.getRandomSampler({
          steps: clonedParams.steps,
          source_processing: clonedParams.source_processing
        })
      }

      await addPendingJobToDexieDb(clonedParams)
    }

    return {
      success: true
    }
  }
}
