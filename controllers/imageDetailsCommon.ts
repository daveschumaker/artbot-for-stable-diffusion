import { createImageJob } from '../utils/imageCache'
import { savePrompt } from '../utils/promptUtils'

export const copyEditPrompt = (imageDetails: any) => {
  savePrompt({
    prompt: imageDetails.prompt,
    sampler: imageDetails.sampler,
    steps: imageDetails.steps,
    cfg_scale: imageDetails.cfg_scale,
    parentJobId: imageDetails.parentJobId,
    negative: imageDetails.negative
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
      .slice(0, 254)
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
  delete cleanParams.jobTimestamp

  const res = await createImageJob({
    ...cleanParams
  })

  if (res.success) {
    return {
      success: true
    }
  }

  return {
    success: false
  }
}

export const uploadImg2Img = (imageDetails: any) => {
  savePrompt({
    img2img: true,
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
    denoising_strength: imageDetails.denoising_strength
  })
}
