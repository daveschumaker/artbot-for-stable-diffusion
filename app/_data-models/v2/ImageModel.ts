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
  MASK = 'mask'
}

class ImageModel {
  jobId: string = '' // Indexed in IndexedDb for later lookups
  hordeId: string = '' // Indexed in IndexedDb for later lookups
  timestamp: number = Date.now()
  status: ImageStatus = ImageStatus.OK
  seed: string = ''
  message: string = '' // Used for error messages
  blob: Blob | null = null
  type: ImageType = ImageType.IMAGE // Indexed on IndexedDb
  model: string = '' // Stable Diffusion image model. Indexed in IndexedDb for later lookups
  worker_id: string = ''
  worker_name: string = ''

  constructor(params: Partial<ImageModel> = {}) {
    Object.assign(this, params)
  }
}

export default ImageModel
