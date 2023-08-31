import PhotoUpIcon from 'components/icons/PhotoUpIcon'
import ImageSquare from 'components/ImageSquare'
import CreateImageRequest from 'models/CreateImageRequest'
import { useCallback, useEffect, useState } from 'react'
import { getParentJobDetails } from 'utils/db'

export default function ParentImage({
  jobId = '',
  parentJobId
}: {
  jobId?: string
  parentJobId: string
}) {
  const [imageType, setImageType] = useState('')
  const [parentImage, setParentImage] = useState('')

  const fetchParentJobDetails = useCallback(async () => {
    const details: CreateImageRequest = await getParentJobDetails(parentJobId)

    if (jobId === details.jobId) {
      setParentImage('')
      return
    }

    if (details.base64String) {
      setParentImage(details.base64String)
      setImageType(details.imageMimeType)
    }
  }, [jobId, parentJobId])

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
