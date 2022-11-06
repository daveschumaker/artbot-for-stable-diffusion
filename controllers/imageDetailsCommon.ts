import { cloneFromImage, setI2iUploaded } from '../store/canvasStore'
import { createImageJob } from '../utils/imageCache'
import { savePrompt, SourceProcessing } from '../utils/promptUtils'

export const copyEditPrompt = (imageDetails: any) => {
  savePrompt({
    prompt: imageDetails.prompt,
    sampler: imageDetails.sampler,
    steps: imageDetails.steps,
    orientation: imageDetails.orientation,
    height: imageDetails.height,
    width: imageDetails.width,
    cfg_scale: imageDetails.cfg_scale,
    parentJobId: imageDetails.parentJobId,
    negative: imageDetails.negative,
    models: imageDetails.models
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
    height: imageDetails.height,
    width: imageDetails.width,
    cfg_scale: imageDetails.cfg_scale,
    parentJobId: imageDetails.parentJobId,
    negative: imageDetails.negative,
    source_image: imageDetails.base64String,
    source_processing: SourceProcessing.InPainting,
    source_mask: imageDetails.source_mask,
    denoising_strength: imageDetails.denoising_strength,
    models: imageDetails.models
  })
}

export const uploadImg2Img = (imageDetails: any) => {
  savePrompt({
    imageType: imageDetails.imageType,
    prompt: imageDetails.prompt,
    sampler: imageDetails.sampler,
    steps: imageDetails.steps,
    orientation: imageDetails.orientation,
    height: imageDetails.height,
    width: imageDetails.width,
    cfg_scale: imageDetails.cfg_scale,
    parentJobId: imageDetails.parentJobId,
    negative: imageDetails.negative,
    source_image: imageDetails.base64String,
    source_processing: SourceProcessing.Img2Img,
    source_mask: '',
    denoising_strength: imageDetails.denoising_strength,
    models: imageDetails.models
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
  const cleanParams = Object.assign({}, imageDetails)

  delete cleanParams.base64String
  delete cleanParams.id
  delete cleanParams.jobId
  delete cleanParams.queue_position
  delete cleanParams.seed
  delete cleanParams.success
  delete cleanParams.timestamp
  delete cleanParams.wait_time
  delete cleanParams.initWaitTime
  delete cleanParams.jobTimestamp
  delete cleanParams.numImages

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
