import { useContext } from 'react'
import { ImageDetailsContext } from '../ImageDetailsProvider'
import CreateImageRequestV2 from 'app/_data-models/v2/CreateImageRequestV2'
import { CONTROL_TYPES, SourceProcessing } from '_types/horde'
import PromptInputSettings from 'app/_data-models/PromptInputSettings'
import { useRouter } from 'next/navigation'
import { getImageByHordeId } from 'app/_db/image_files'
import { blobToBase64 } from 'app/_utils/blobUtils'
import NiceModal from '@ebay/nice-modal-react'

type UseSourceImageReturnType = [
  () => Promise<void>,
  () => Promise<void>,
  () => Promise<void>
]

export default function useSourceImage(): UseSourceImageReturnType {
  const router = useRouter()
  const context = useContext(ImageDetailsContext)
  const { currentImageId, imageDetails } = context

  const onUseControlNetClick = async () => {
    const image = await getImageByHordeId(currentImageId)
    if (image && 'blob' in image && image.blob) {
      const base64 = await blobToBase64(image.blob)

      const transformJob = CreateImageRequestV2.toDefaultPromptInput(
        Object.assign({}, imageDetails, {
          numImages: 1,
          seed: ''
        })
      )

      transformJob.source_mask = ''
      transformJob.source_processing = SourceProcessing.Img2Img
      transformJob.control_type = CONTROL_TYPES.canny
      transformJob.source_image = base64
      await PromptInputSettings.updateSavedInput_NON_DEBOUNCED(transformJob)

      router.push(`/create?panel=img2img&edit=true`)
      NiceModal.remove('image-modal')
    }
  }

  const onUseImg2ImgClick = async () => {
    const image = await getImageByHordeId(currentImageId)
    if (image && 'blob' in image && image.blob) {
      const base64 = await blobToBase64(image.blob)

      const transformJob = CreateImageRequestV2.toDefaultPromptInput(
        Object.assign({}, imageDetails, {
          control_type: '',
          numImages: 1,
          seed: '',
          source_image: base64,
          source_mask: '',
          source_processing: SourceProcessing.Img2Img
        })
      )
      await PromptInputSettings.updateSavedInput_NON_DEBOUNCED(transformJob)

      router.push(`/create?panel=img2img&edit=true`)
      NiceModal.remove('image-modal')
    }
  }

  const onUseInpaintingClick = async () => {
    const image = await getImageByHordeId(currentImageId)
    if (image && 'blob' in image && image.blob) {
      const base64 = await blobToBase64(image.blob)

      const transformJob = CreateImageRequestV2.toDefaultPromptInput(
        Object.assign({}, imageDetails, {
          control_type: '',
          numImages: 1,
          seed: '',
          source_image: base64,
          source_mask: '',
          source_processing: SourceProcessing.InPainting
        })
      )
      await PromptInputSettings.updateSavedInput_NON_DEBOUNCED(transformJob)

      router.push(`/create?panel=inpainting&edit=true`)
      NiceModal.remove('image-modal')
    }
  }

  return [onUseControlNetClick, onUseImg2ImgClick, onUseInpaintingClick]
}
