export enum ImageStatus {
  CENSORED = 'censored',
  ERROR = 'error',
  OK = 'ok'
}

export enum ImageType {
  IMAGE = 'image', // Default image type. e.g., response from AI Horde
  THUMB = 'thumbnail',
  CONTROLNET = 'controlnet',
  SOURCE = 'source', // Uploaded img for img2img or ControlNet
  MASK = 'mask',
  UPSCALE = 'upscale'
}

class ImageFile {
  // Indexed fields
  jobId: string = ''
  imageId: string = '' // HordeId
  imageType: ImageType = ImageType.IMAGE
  imageStatus: ImageStatus = ImageStatus.OK
  model: string = ''

  // Other fields
  imageBlob?: Blob | null = null
  seed: string = ''
  worker_id: string = ''
  worker_name: string = ''

  constructor(params: Partial<ImageFile>) {
    Object.assign(this, params)
  }
}

export { ImageFile }
