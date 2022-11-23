import RerollImageRequest from '../models/RerollImageRequest'
import { cloneFromImage, setI2iUploaded } from '../store/canvasStore'
import { createImageJob } from '../utils/imageCache'
import { createPendingRerollJob } from '../utils/pendingUtils'
import { savePrompt, SourceProcessing } from '../utils/promptUtils'

export const copyEditPrompt = (imageDetails: any) => {
  savePrompt({
    prompt: imageDetails.prompt,
    sampler: imageDetails.sampler,
    steps: imageDetails.steps,
    orientation: imageDetails.orientation,
    karras: imageDetails.karras,
    height: imageDetails.height,
    width: imageDetails.width,
    cfg_scale: imageDetails.cfg_scale,
    parentJobId: imageDetails.parentJobId,
    negative: imageDetails.negative,
    models: imageDetails?.models[0]
      ? imageDetails.models
      : [imageDetails.model || 'stable_diffusion']
  })
}

export const uploadInpaint = (imageDetails: any, clone = false) => {
  if (clone) {
    cloneFromImage(imageDetails.canvasStore)
  }

  const i2iBase64String = {
    base64String: `data:${imageDetails.imageType};base64,${imageDetails.base64String}`,
    width: imageDetails.width,
    height: imageDetails.height
  }
  setI2iUploaded(i2iBase64String)

  savePrompt({
    imageType: imageDetails.imageType,
    prompt: imageDetails.prompt,
    sampler: imageDetails.sampler,
    steps: imageDetails.steps,
    orientation: imageDetails.orientation,
    karras: imageDetails.karras,
    height: imageDetails.height,
    width: imageDetails.width,
    cfg_scale: imageDetails.cfg_scale,
    parentJobId: imageDetails.parentJobId,
    negative: imageDetails.negative,
    source_image: imageDetails.base64String,
    source_processing: SourceProcessing.InPainting,
    source_mask: imageDetails.source_mask,
    denoising_strength: imageDetails.denoising_strength,
    models: imageDetails?.models[0]
      ? imageDetails.models
      : [imageDetails.model || 'stable_diffusion']
  })
}

export const uploadImg2Img = (imageDetails: any) => {
  savePrompt({
    imageType: imageDetails.imageType,
    prompt: imageDetails.prompt,
    sampler: imageDetails.sampler,
    steps: imageDetails.steps,
    orientation: imageDetails.orientation,
    karras: imageDetails.karras,
    height: imageDetails.height,
    width: imageDetails.width,
    cfg_scale: imageDetails.cfg_scale,
    parentJobId: imageDetails.parentJobId,
    negative: imageDetails.negative,
    source_image: imageDetails.base64String,
    source_processing: SourceProcessing.Img2Img,
    source_mask: '',
    denoising_strength: imageDetails.denoising_strength,
    models: imageDetails?.models[0]
      ? imageDetails.models
      : [imageDetails.model || 'stable_diffusion']
  })
}

export const downloadImage = async (imageDetails: any) => {
  const res = await fetch(`/artbot/api/get-png`, {
    method: 'POST',
    body: JSON.stringify({
      imgString: imageDetails.base64String
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const data = await res.json()
  const { success } = data

  if (success) {
    const filename = imageDetails.prompt
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()
      .slice(0, 128)
    var a = document.createElement('a')
    a.href = 'data:image/png;base64,' + data.base64String
    a.download = filename + '.png'
    a.click()

    return {
      success: true
    }
  }

  return {
    success: false
  }
}

export const rerollImage = async (imageDetails: any) => {
  const rerollImageJob = new RerollImageRequest(imageDetails)
  const res = await createPendingRerollJob(rerollImageJob)

  // const cleanParams = Object.assign({}, imageDetails)
  // delete cleanParams.base64String
  // delete cleanParams.id
  // delete cleanParams.jobId
  // delete cleanParams.queue_position
  // delete cleanParams.seed
  // delete cleanParams.success
  // delete cleanParams.timestamp
  // delete cleanParams.wait_time
  // delete cleanParams.initWaitTime
  // delete cleanParams.jobTimestamp
  // delete cleanParams.numImages
  // delete cleanParams.favorited
  // delete cleanParams.useAllModels

  // const res = await createImageJob({
  //   ...rerollImageJob
  // })

  if (res?.success) {
    return {
      success: true
    }
  }

  return {
    success: false
  }
}

export const upscaleImage = async (imageDetails: any) => {
  const cleanParams = Object.assign({}, imageDetails)

  delete cleanParams.base64String
  delete cleanParams.id
  delete cleanParams.jobId
  delete cleanParams.queue_position
  delete cleanParams.success
  delete cleanParams.timestamp
  delete cleanParams.wait_time
  delete cleanParams.initWaitTime
  delete cleanParams.jobTimestamp
  delete cleanParams.numImages
  delete cleanParams.favorited
  delete cleanParams.useAllModels

  cleanParams.upscaled = true
  cleanParams.post_processing = ['RealESRGAN_x4plus']

  const res = await createImageJob({
    ...cleanParams
  })

  if (res?.success) {
    return {
      success: true
    }
  }

  return {
    success: false
  }
}
