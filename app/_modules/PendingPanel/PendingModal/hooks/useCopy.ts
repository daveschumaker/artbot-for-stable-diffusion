import { copyEditPrompt } from 'app/_controllers/imageDetailsCommon'
import { useContext } from 'react'
import { ImageDetailsContext } from '../ImageDetailsProvider'
import { useRouter } from 'next/navigation'
import NiceModal from '@ebay/nice-modal-react'
import { getImageByHordeId } from 'app/_db/image_files'
import { ArtBotBlobType, initBlob } from 'app/_utils/blobUtils'
import { showErrorToast, showSuccessToast } from 'app/_utils/notificationUtils'

type UseCopyReturnType = [
  () => Promise<void>,
  () => Promise<void>,
  () => Promise<void>
]

export default function useCopy(): UseCopyReturnType {
  const router = useRouter()
  const context = useContext(ImageDetailsContext)
  const { currentImageId, imageDetails } = context

  const onCopyPromptClick = async () => {
    await copyEditPrompt(imageDetails)
    router.push(`/create?edit=true`)
    NiceModal.remove('image-modal')
  }

  const onCopyImageDetailsClick = async () => {
    await copyEditPrompt(imageDetails)
    router.push(`/create?edit=true`)
    NiceModal.remove('image-modal')
  }

  const onCopyImageClick = async () => {
    const image = await getImageByHordeId(currentImageId)

    try {
      if (image && 'blob' in image && image.blob) {
        initBlob()
        const imageBlob = image.blob as ArtBotBlobType

        // Only PNGs can be copied to the clipboard
        const newBlob = await imageBlob.toPNG()

        navigator.clipboard.write([new ClipboardItem({ 'image/png': newBlob })])
        showSuccessToast({
          message: 'Image copied to your clipboard!'
        })
        return
      } else {
        showErrorToast({
          message: 'Unable to copy image to clipboard.'
        })
      }
    } catch (err) {
      console.log(`Error: Unable to copy image to clipboard.`)
      console.log(err)
      showErrorToast({
        message: 'Unable to copy image to clipboard.'
      })
    }
  }

  return [onCopyPromptClick, onCopyImageDetailsClick, onCopyImageClick]
}
