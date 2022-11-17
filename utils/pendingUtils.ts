import { modelInfoStore } from '../store/modelStore'
import { CreatePendingJob, JobStatus } from '../types'
import { uuidv4 } from './appUtils'
import { db } from './db'
import { orientationDetails, randomSampler } from './imageUtils'
import { SourceProcessing } from './promptUtils'

interface ImageSize {
  orientation: string
  height: number
  width: number
}

const cloneImageParams = (imageParams: CreatePendingJob) => {
  const clonedParams = Object.assign({}, imageParams)
  delete clonedParams.id

  // Create a temporary uuid for easier lookups.
  // Will be replaced later when job is accepted
  // by API
  clonedParams.jobId = uuidv4()
  clonedParams.timestamp = Date.now()

  if (clonedParams.sampler === 'random') {
    const isImg2Img =
      !clonedParams.img2img &&
      clonedParams.source_processing !== SourceProcessing.Img2Img &&
      clonedParams.source_processing !== SourceProcessing.InPainting
    clonedParams.sampler = randomSampler(clonedParams.steps, isImg2Img)
  }

  const imageSize: ImageSize = orientationDetails(
    clonedParams.orientationType || 'square',
    clonedParams.height,
    clonedParams.width
  )

  clonedParams.orientation = imageSize.orientation
  clonedParams.height = imageSize.height
  clonedParams.width = imageSize.width

  if (clonedParams.models[0] === 'random') {
    const currentModels = modelInfoStore.state.availableModelNames
    const randomModel =
      currentModels[Math.floor(Math.random() * currentModels.length)]
    clonedParams.models = [randomModel]
  }

  return clonedParams
}

export const createPendingJob = async (imageParams: CreatePendingJob) => {
  const { prompt } = imageParams
  let { numImages = 1 } = imageParams

  if (!prompt || !prompt?.trim()) {
    return []
  }

  if (isNaN(numImages) || numImages < 1 || numImages > 50) {
    numImages = 1
  }

  // Used in tracking groups of related images over multiple
  // generation events. e.g., if someone makes a bunch of photos of robots
  // and then comes back a few days later to pick up where they left off.
  // All those images should logically be grouped together.
  if (!imageParams.parentJobId) {
    imageParams.parentJobId = uuidv4()
  }

  // Used in tracking groups of images created per generation event.
  // e.g., if someone makes a group of 20 photos of robots, they will have the
  // same timestamp. Then later come back and make another group, they
  // will have a different timestamp.
  imageParams.jobTimestamp = Date.now()
  imageParams.groupJobId = uuidv4()

  imageParams.jobStatus = JobStatus.Waiting
  let clonedParams

  if (imageParams.useAllModels) {
    imageParams.numImages = 1
    const models = modelInfoStore.state.availableModels

    for (const model of models) {
      const { name: modelName } = model

      // It doesn't make sense to include this in all models mode.
      if (modelName === 'stable_diffusion_inpainting') {
        return
      }

      clonedParams = cloneImageParams(imageParams)
      clonedParams.models = [modelName]

      try {
        await db.pending.add({
          ...clonedParams
        })
      } catch (err) {
        // Ah well
      }
    }
  } else {
    const count = Array(Number(numImages)).fill(0)

    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    for (const _num of count) {
      clonedParams = cloneImageParams(imageParams)

      try {
        await db.pending.add({
          ...clonedParams
        })
      } catch (err) {
        // Ah well
      }
    }
  }
}
