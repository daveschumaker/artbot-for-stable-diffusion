import RerollImageRequest from '../models/RerollImageRequest'
import UpscaleImageRequest from '../models/UpscaleImageRequest'
import { cloneFromImage, setI2iUploaded } from '../store/canvasStore'
import { createImageJob } from '../utils/imageCache'
import { downloadFile } from '../utils/imageUtils'
import { setImageForInterrogation } from '../utils/interrogateUtils'
import { createPendingRerollJob } from '../utils/pendingUtils'
import { savePrompt, SourceProcessing } from '../utils/promptUtils'

export const interrogateImage = (imageDetails: any) => {
  setImageForInterrogation(imageDetails)
}

export const copyEditPrompt = (imageDetails: any) => {
  savePrompt({
    prompt: imageDetails.prompt,
    sampler: imageDetails.sampler,
    steps: imageDetails.steps,
    orientation: imageDetails.orientation,
    karras: imageDetails.karras,
    height: imageDetails.height,
    width: imageDetails.width,
    seed: imageDetails.seed,
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
  downloadFile(imageDetails)
}

export const rerollImage = async (imageDetails: any) => {
  const rerollImageJob = new RerollImageRequest(imageDetails)
  const res = await createPendingRerollJob(rerollImageJob)

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
  const cleanParams = new UpscaleImageRequest(imageDetails)
  const res = await createImageJob(cleanParams)

  if (res?.success) {
    return {
      success: true
    }
  }

  return {
    success: false
  }
}
