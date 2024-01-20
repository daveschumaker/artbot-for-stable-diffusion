import { JobStatus } from '_types'
import CreateImageRequestV2 from 'app/_data-models/v2/CreateImageRequestV2'
import ImageModel from 'app/_data-models/v2/ImageModel'
import { getAllImagesByJobId } from 'app/_db/image_files'
import { useCallback, useEffect, useState } from 'react'
import Carousel from 'app/_modules/Carousel'

export default function ImageModalV2({
  imageDetails
}: {
  imageDetails: CreateImageRequestV2
}) {
  const [imageSrcs, setImageSrcs] = useState<string[]>([])

  const loadImage = useCallback(async () => {
    if (imageDetails.version === 2) {
      const srcs: string[] = []
      const data = await getAllImagesByJobId(imageDetails.jobId)
      data.forEach((image: ImageModel) => {
        if (image.blob) {
          srcs.push(URL.createObjectURL(image.blob))
        }
      })

      setImageSrcs(srcs)
    }
  }, [imageDetails.jobId, imageDetails.version])

  useEffect(() => {
    if (!imageSrcs[0] && imageDetails.jobStatus === JobStatus.Done) {
      loadImage()
    }

    // Clean up Blob URL when the component unmounts
    return () => {
      if (imageSrcs[0]) URL.revokeObjectURL(imageSrcs[0])
    }
  }, [imageSrcs, loadImage, imageDetails.jobStatus])

  console.log(`fart`, imageSrcs)
  return (
    <div>
      <Carousel
        images={imageSrcs}
        height={imageDetails.height}
        width={imageDetails.width}
      />
      <div>But wait! There's more!</div>
      <div>But wait! There's more!</div>
      <div>But wait! There's more!</div>
      <div>But wait! There's more!</div>
      <div>But wait! There's more!</div>
    </div>
  )
}
