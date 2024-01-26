import CreateImageRequestV2 from 'app/_data-models/v2/CreateImageRequestV2'
import ImageModel from 'app/_data-models/v2/ImageModel'
import { getAllImagesByJobId } from 'app/_db/image_files'
import { useCallback, useEffect, useState } from 'react'
import Carousel from 'app/_modules/Carousel'

interface ImageSrc {
  id: string
  url: string
}

export default function ImageDisplay({
  imageDetails,
  setCurrentImageId = () => {}
}: {
  imageDetails: CreateImageRequestV2
  setCurrentImageId?: (id: string) => void
}) {
  const [imageSrcs, setImageSrcs] = useState<ImageSrc[]>([])

  const loadImage = useCallback(async () => {
    if (imageDetails.version === 2) {
      const srcs: ImageSrc[] = []
      const data = await getAllImagesByJobId(imageDetails.jobId)
      data.forEach((image: ImageModel) => {
        if (image.blob) {
          srcs.push({
            id: image.hordeId,
            url: URL.createObjectURL(image.blob)
          })
        }
      })

      if (srcs[0]) {
        setCurrentImageId(srcs[0].id)
      }

      setImageSrcs(srcs)
    }
  }, [setCurrentImageId, imageDetails.jobId, imageDetails.version])

  useEffect(() => {
    if (!imageSrcs[0]) {
      loadImage()
    }

    // Clean up Blob URL when the component unmounts
    return () => {
      if (imageSrcs[0]?.url) URL.revokeObjectURL(imageSrcs[0].url)
    }
  }, [imageSrcs, loadImage, imageDetails.jobStatus])

  return (
    <div className="mb-2">
      <Carousel
        updateImageIndex={(i: number) => setCurrentImageId(imageSrcs[i].id)}
        images={imageSrcs.map((image) => image.url)}
        height={imageDetails.height}
        width={imageDetails.width}
      />
    </div>
  )
}
