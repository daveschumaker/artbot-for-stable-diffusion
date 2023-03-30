import PhotoUpIcon from 'components/icons/PhotoUpIcon'
import ImageSquare from 'components/ImageSquare'
import { useCallback, useEffect, useState } from 'react'
import { IImageDetails } from 'types'
import { fetchRelatedImages } from 'utils/db'

const RenderParentImage = ({ parentJobId }: { parentJobId: string }) => {
  const [imageType, setImageType] = useState('')
  const [parentImage, setParentImage] = useState('')

  const fetchParentJobDetails = useCallback(async () => {
    const relatedImagesArray: Array<IImageDetails> =
      (await fetchRelatedImages(parentJobId, 1, 'normal')) || []
    const details: IImageDetails = relatedImagesArray[0] || {}

    if (details.base64String) {
      setParentImage(details.base64String)
      setImageType(details.imageType)
    }
  }, [parentJobId])

  useEffect(() => {
    if (!parentJobId) {
      return
    }

    fetchParentJobDetails()
  }, [fetchParentJobDetails, parentJobId])

  if (!parentImage) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-bold flex flex-row gap-2 items-center mb-[4px]">
        <PhotoUpIcon />
        Parent image
      </div>
      <div>
        <ImageSquare
          imageDetails={{ base64String: parentImage }}
          imageType={imageType}
          size={140}
        />
      </div>
    </div>
  )
}

export default RenderParentImage
