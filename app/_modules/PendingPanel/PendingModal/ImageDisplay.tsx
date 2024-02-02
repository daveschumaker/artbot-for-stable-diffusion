import { useCallback, useContext } from 'react'
import Carousel from 'app/_modules/Carousel'
import { ImageDetailsContext } from './ImageDetailsProvider'

export default function ImageDisplay() {
  const context = useContext(ImageDetailsContext)
  const {
    imageDetails,
    imageSrcs,
    inProgressHasImages,
    isDone,
    setCurrentImageId
  } = context

  const showComponent = isDone || inProgressHasImages

  const updateImageId = useCallback(
    (i: number) => {
      if (!imageSrcs[i]) return

      console.log(`hello id?`, i, imageSrcs[i].id)
      setCurrentImageId(imageSrcs[i].id)
    },
    [imageSrcs, setCurrentImageId]
  )

  if (!showComponent) return null

  return (
    <div className="mb-2">
      <Carousel
        updateImageId={updateImageId}
        images={imageSrcs.map((image) => image.url)}
        height={imageDetails.height}
        width={imageDetails.width}
      />
    </div>
  )
}
