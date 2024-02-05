import { ImageSrc } from '_types/artbot'
import CreateImageRequestV2 from 'app/_data-models/v2/CreateImageRequestV2'
import ImageModel from 'app/_data-models/v2/ImageModel'
import { getAllImagesByJobId } from 'app/_db/image_files'
import { useCallback, useEffect, useState } from 'react'

export default function useImageArray({
  imageDetails,
  setCurrentImageId = () => {}
}: {
  imageDetails: CreateImageRequestV2
  setCurrentImageId?: (id: string) => void
}) {
  const [imageSrcs, setImageSrcs] = useState<ImageSrc[]>([])

  const loadImage = useCallback(async () => {
    const srcs: ImageSrc[] = []
    const data = await getAllImagesByJobId(imageDetails.jobId)

    data.forEach((image: {}) => {
      if ('blob' in image) {
        const typedImage = image as ImageModel

        if (typedImage.blob) {
          srcs.push({
            id: typedImage.hordeId,
            url: URL.createObjectURL(typedImage.blob)
          })
        }
      }
    })

    if (srcs[0]) {
      setCurrentImageId(srcs[0].id)
    }

    setImageSrcs(srcs)
  }, [setCurrentImageId, imageDetails.jobId])

  useEffect(() => {
    if (!imageSrcs[0]) {
      loadImage()
    }

    // Clean up Blob URL when the component unmounts
    return () => {
      if (imageSrcs[0]?.url) URL.revokeObjectURL(imageSrcs[0].url)
    }
  }, [imageSrcs, loadImage, imageDetails.jobStatus])

  return [imageSrcs]
}
