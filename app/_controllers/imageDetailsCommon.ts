import UpscaleImageRequest from 'app/_data-models/UpscaleImageRequest'
import {
  clearI2IString,
  cloneFromImage,
  setI2iUploaded,
  storeCanvas
} from 'app/_store/canvasStore'
import { downloadFile } from 'app/_utils/imageUtils'
import { setImageForInterrogation } from 'app/_utils/interrogateUtils'
import { createPendingRerollJob } from 'app/_utils/pendingUtils'
import {
  savePrompt,
  savePromptV2,
  SourceProcessing
} from 'app/_utils/promptUtils'
import Samplers from 'app/_data-models/Samplers'
import CreateImageRequest from 'app/_data-models/CreateImageRequest'
import { createImageJob } from 'app/_utils/V2/createImageJob'

export const interrogateImage = (imageDetails: any) => {
  setImageForInterrogation(imageDetails)
}

export const copyEditPrompt = async (imageDetails: any) => {
  await savePromptV2(imageDetails)
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
    const CreateCanvas = (await import('app/_data-models/CreateCanvas')).default

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

  let sampler = imageDetails.sampler
  if (!Samplers.validSamplersForImg2Img().includes(sampler)) {
    sampler = 'k_dpm_2'
  }

  savePrompt({
    imageType: imageDetails.imageType,
    prompt: imageDetails.prompt,
    sampler,
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
  clearI2IString()
  const { useSourceImg = false } = options

  // If used for img2img request, invalidate any inpainting model since we aren't passing along source_mask
  if (
    imageDetails?.models[0] &&
    imageDetails?.models[0].includes('_inpainting')
  ) {
    imageDetails.models[0] = 'stable_diffusion'
  }

  let sampler = imageDetails.sampler
  if (!Samplers.validSamplersForImg2Img().includes(sampler)) {
    sampler = 'k_dpm_2'
  }

  savePrompt({
    imageType: imageDetails.imageType,
    prompt: imageDetails.prompt,
    sampler,
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
  const transformJob = CreateImageRequest.toDefaultPromptInput(
    Object.assign({}, imageDetails, { numImages: 1, seed: '' })
  )
  const rerollImageJob = new CreateImageRequest(transformJob)
  const res = await createPendingRerollJob(rerollImageJob)

  // @ts-ignore
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
  const defaultInput = CreateImageRequest.toDefaultPromptInput(cleanParams)
  const res = await createImageJob(
    defaultInput as unknown as CreateImageRequest
  )

  if (res?.success) {
    return {
      success: true
    }
  }

  return {
    success: false
  }
}
