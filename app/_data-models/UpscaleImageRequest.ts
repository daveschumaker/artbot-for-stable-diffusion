import { ImageSize } from '_types'
import { orientationDetails } from 'app/_utils/imageUtils'
import CreateImageRequest from './CreateImageRequest'
import DefaultPromptInput from './DefaultPromptInput'

// The input is a stored image's details: the CreateImageRequest constructor
// reads it as DefaultPromptInput, and `orientation` is read below.
type UpscaleImageParams = DefaultPromptInput &
  Partial<Pick<CreateImageRequest, 'orientation'>>

class UpscaleImageRequest extends CreateImageRequest {
  constructor(params: UpscaleImageParams) {
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
    this.useAllModels = false
    this.upscaled = true
    this.post_processing = [...post_processing, 'RealESRGAN_x4plus']
  }
}

export default UpscaleImageRequest
