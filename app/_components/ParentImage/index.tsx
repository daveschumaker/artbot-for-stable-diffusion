import CreateImageRequest from 'app/_data-models/CreateImageRequest'
import { useCallback, useEffect, useState } from 'react'
import { getParentJobDetails } from 'app/_utils/db'
import { IconPhotoUp } from '@tabler/icons-react'
import ImageSquare from 'app/_modules/ImageSquare'

export default function ParentImage({
  jobId = '',
  parentJobId
}: {
  jobId?: string
  parentJobId: string
}) {
  const [parentImage, setParentImage] = useState('')

  const fetchParentJobDetails = useCallback(async () => {
    const details: CreateImageRequest = await getParentJobDetails(parentJobId)

    if (jobId === details.jobId) {
      setParentImage('')
      return
    }

    if (details.base64String) {
      setParentImage(details.base64String)
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
        <IconPhotoUp />
        Parent image
      </div>
      <div>
        <ImageSquare imageDetails={{ base64String: parentImage }} size={140} />
      </div>
    </div>
  )
}
