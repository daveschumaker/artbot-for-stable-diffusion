import PromptInputSettings from 'models/PromptInputSettings'
import RerollImageRequest from '../models/RerollImageRequest'
import UpscaleImageRequest from '../models/UpscaleImageRequest'
import {
  clearCanvasStore,
  clearI2IString,
  cloneFromImage,
  setI2iUploaded,
  storeCanvas
} from '../store/canvasStore'
import { createImageJob } from '../utils/imageCache'
import { downloadFile } from '../utils/imageUtils'
import { setImageForInterrogation } from '../utils/interrogateUtils'
import { createPendingRerollJob } from '../utils/pendingUtils'
import { savePrompt, SourceProcessing } from '../utils/promptUtils'

export const interrogateImage = (imageDetails: any) => {
  setImageForInterrogation(imageDetails)
}

export const copyEditPrompt = (imageDetails: any) => {
  PromptInputSettings.clear()

  savePrompt({
    prompt: imageDetails.prompt,
    sampler: imageDetails.sampler,
    steps: imageDetails.steps,
    orientation: imageDetails.orientation,
    karras: imageDetails.karras,
    hires: imageDetails.hires,
    clipskip: imageDetails.clipskip,
    height: imageDetails.height,
    width: imageDetails.width,
    seed: imageDetails.seed,
    cfg_scale: imageDetails.cfg_scale,
    parentJobId: imageDetails.parentJobId,
    negative: imageDetails.negative,
    tiling: imageDetails.tiling,
    source_processing: imageDetails.source_processing,
    source_image: imageDetails.source_image,
    source_mask: imageDetails.source_mask,
    post_processing: imageDetails.post_processing,
    models: imageDetails?.models[0]
      ? imageDetails.models
      : [imageDetails.model || 'stable_diffusion']
  })
}

/**
 * Can be used to upload an existing image from your ArtBot library as a new inpainting image
 * or can be used to clone a previously used source_image and image mask.
 * @param imageDetails
 * @param options
 */
export const uploadInpaint = async (imageDetails: any, options: any = {}) => {
  const { clone = false, useSourceImg = false, useSourceMask = false } = options

  if (clone) {
    storeCanvas('drawLayer', imageDetails.canvasData)
    storeCanvas('maskLayer', imageDetails.maskData)
    cloneFromImage(imageDetails.canvasData)
  }

  let sourceMaskToUse: string = ''
  if (useSourceMask) {
    // TODO: Importing this causes Fabric to be built as part of
    // app chunk, doubling size of initial JS library. Find a way to split this out.
    //@ts-ignore
    const CreateCanvas = (await import('../models/CreateCanvas')).default

    sourceMaskToUse = await CreateCanvas.getMaskForInput(
      imageDetails.maskData,
      imageDetails.height,
      imageDetails.width
    )
  }

  const i2iBase64String = {
    base64String: `data:${imageDetails.imageType};base64,${imageDetails.base64String}`,
    width: imageDetails.width,
    height: imageDetails.height
  }

  if (useSourceImg) {
    i2iBase64String.base64String = `data:image/webp;base64,${imageDetails.source_image}`
  }

  setI2iUploaded(i2iBase64String)

  PromptInputSettings.clear()
  savePrompt({
    imageType: imageDetails.imageType,
    prompt: imageDetails.prompt,
    sampler: imageDetails.sampler,
    steps: imageDetails.steps,
    orientation: imageDetails.orientation,
    karras: imageDetails.karras,
    hires: imageDetails.hires,
    clipskip: imageDetails.clipskip,
    height: imageDetails.height,
    width: imageDetails.width,
    cfg_scale: imageDetails.cfg_scale,
    parentJobId: imageDetails.parentJobId,
    negative: imageDetails.negative,
    source_image:
      useSourceImg || clone
        ? imageDetails.source_image
        : imageDetails.base64String,
    source_processing: SourceProcessing.InPainting,

    // Don't set source_mask here, in case of img2img mask (which is inverted), it will be inverted again.
    // Use CreateCanvas class to restore mask and then automatically add to input the correct way.
    source_mask: sourceMaskToUse,

    denoising_strength: imageDetails.denoising_strength,
    models: imageDetails?.models[0]
      ? imageDetails.models
      : [imageDetails.model || 'stable_diffusion'],

    canvasData: clone ? imageDetails.canvasData : null,
    maskData: clone ? imageDetails.maskData : null
  })
}

export const uploadImg2Img = (imageDetails: any, options: any = {}) => {
  clearCanvasStore()
  clearI2IString()
  const { useSourceImg = false } = options

  // If used for img2img request, invalidate any inpainting model since we aren't passing along source_mask
  if (
    imageDetails?.models[0] &&
    imageDetails?.models[0].includes('_inpainting')
  ) {
    imageDetails.models[0] = 'stable_diffusion'
  }

  savePrompt({
    imageType: imageDetails.imageType,
    prompt: imageDetails.prompt,
    sampler: imageDetails.sampler,
    steps: imageDetails.steps,
    orientation: imageDetails.orientation,
    karras: imageDetails.karras,
    hires: imageDetails.hires,
    clipskip: imageDetails.clipskip,
    height: imageDetails.height,
    width: imageDetails.width,
    cfg_scale: imageDetails.cfg_scale,
    parentJobId: imageDetails.parentJobId,
    negative: imageDetails.negative,
    source_image: useSourceImg
      ? imageDetails.source_image
      : imageDetails.base64String,
    source_processing: SourceProcessing.Img2Img,
    source_mask: '',
    denoising_strength: imageDetails.denoising_strength,
    control_type: imageDetails.control_type,
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
