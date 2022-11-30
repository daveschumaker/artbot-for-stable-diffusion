import { MAX_IMAGES_PER_JOB } from '../constants'
import CreateImageRequest from '../models/CreateImageRequest'
import RerollImageRequest from '../models/RerollImageRequest'
import { modelInfoStore } from '../store/modelStore'
import { uuidv4 } from './appUtils'
import { db } from './db'
import { randomPropertyName } from './helperUtils'
import { stylePresets } from './stylePresets'

const cloneImageParams = (
  imageParams: CreateImageRequest | RerollImageRequest
) => {
  const clonedParams = Object.assign({}, imageParams)

  // Create a temporary uuid for easier lookups.
  // Will be replaced later when job is accepted
  // by API
  clonedParams.jobId = uuidv4()
  clonedParams.timestamp = Date.now()

  return clonedParams
}

export const createPendingRerollJob = async (
  imageParams: RerollImageRequest
) => {
  const clonedParams = cloneImageParams(imageParams)

  try {
    await db.pending.add({
      ...clonedParams
    })
  } finally {
    return {
      success: true
    }
  }
}

export const createPendingJob = async (imageParams: CreateImageRequest) => {
  const { prompt } = imageParams
  let { numImages = 1 } = imageParams

  if (!prompt || !prompt?.trim()) {
    return []
  }

  if (isNaN(numImages) || numImages < 1 || numImages > MAX_IMAGES_PER_JOB) {
    numImages = 1
  }

  let clonedParams

  if (imageParams.models.length > 1) {
    imageParams.models.forEach(async (model) => {
      clonedParams = cloneImageParams(imageParams)
      clonedParams.models = [model]

      if (model === 'stable_diffusion_2.0') {
        clonedParams.sampler = 'dpmsolver'
      }

      try {
        for (let i = 0; i < numImages; i++) {
          if (clonedParams.stylePreset === 'random') {
            clonedParams.stylePreset = randomPropertyName(stylePresets)

            // @ts-ignore
            clonedParams.models = [stylePresets[clonedParams.stylePreset].model]
          }

          if (clonedParams.models[0] === 'random') {
            clonedParams.models = [CreateImageRequest.getRandomModel()]
          }

          if (clonedParams.sampler === 'random') {
            clonedParams.sampler = CreateImageRequest.getRandomSampler({
              steps: clonedParams.steps,
              source_processing: clonedParams.source_processing
            })
          }

          db.pending.add({
            ...clonedParams
          })
        }
      } catch (err) {}
    })

    return {
      success: true
    }
  } else if (imageParams.useAllModels) {
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

      if (modelName === 'stable_diffusion_2.0') {
        clonedParams.sampler = 'dpmsolver'
      }

      if (clonedParams.models[0] === 'random') {
        clonedParams.models = [CreateImageRequest.getRandomModel()]
      }

      if (clonedParams.sampler === 'random') {
        clonedParams.sampler = CreateImageRequest.getRandomSampler({
          steps: clonedParams.steps,
          source_processing: clonedParams.source_processing
        })
      }

      try {
        await db.pending.add({
          ...clonedParams
        })
      } catch (err) {}
    }

    return {
      success: true
    }
  } else {
    const count = Array(Number(numImages)).fill(0)

    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    for (const _num of count) {
      clonedParams = cloneImageParams(imageParams)

      if (clonedParams.stylePreset === 'random') {
        clonedParams.stylePreset = randomPropertyName(stylePresets)

        // @ts-ignore
        clonedParams.models = [stylePresets[clonedParams.stylePreset].model]
      }

      if (clonedParams.models[0] === 'random') {
        clonedParams.models = [CreateImageRequest.getRandomModel()]
      }

      if (clonedParams.sampler === 'random') {
        clonedParams.sampler = CreateImageRequest.getRandomSampler({
          steps: clonedParams.steps,
          source_processing: clonedParams.source_processing
        })
      }

      try {
        await db.pending.add({
          ...clonedParams
        })
      } catch (err) {}
    }

    return {
      success: true
    }
  }
}
