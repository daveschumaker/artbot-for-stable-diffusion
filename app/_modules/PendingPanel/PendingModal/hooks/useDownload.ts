import { useContext } from 'react'
import { ImageDetailsContext } from '../ImageDetailsProvider'
import { getImageByHordeId } from 'app/_db/image_files'
import { downloadBlob } from 'app/_utils/imageUtils'

type UseDownloadReturnType = [() => Promise<void>]

export default function useDownload(): UseDownloadReturnType {
  const context = useContext(ImageDetailsContext)
  const { currentImageId, imageDetails } = context

  const onDownloadClick = async () => {
    const image = await getImageByHordeId(currentImageId)
    if (image && 'blob' in image) {
      await downloadBlob(image.blob as Blob, imageDetails.prompt)
    }
  }

  return [onDownloadClick]
}
