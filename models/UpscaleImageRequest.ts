import { ImageSize } from '../types'
import { orientationDetails } from '../utils/imageUtils'
import CreateImageRequest, { IRequestParams } from './CreateImageRequest'

export interface IUpscaleRequestParams extends IRequestParams {
  orientation?: string
}

class UpscaleImageRequest extends CreateImageRequest {
  constructor(params: IUpscaleRequestParams) {
    super(params)

    const {
      orientation: orientationType = 'square',
      height,
      post_processing = [],
      width
    } = params
    const imageSize: ImageSize = orientationDetails(
      orientationType,
      height,
      width
    )

    this.orientation = imageSize.orientation
    this.width = Number(imageSize.width)
    this.height = Number(imageSize.height)
    this.numImages = 1
    this.upscaled = true
    this.post_processing = [...post_processing, 'RealESRGAN_x4plus']
  }
}

export default UpscaleImageRequest
