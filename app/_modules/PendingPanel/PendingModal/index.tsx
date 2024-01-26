import { useState } from 'react'
import { JobStatus } from '_types/artbot'
import CreateImageRequestV2 from 'app/_data-models/v2/CreateImageRequestV2'
import ImageDetails from './ImageDetails'
import ImageDisplay from './ImageDisplay'
import ImageJobStatus from './ImageJobStatus'
import ImageOptions from './ImageOptions'

export default function PendingModal({
  imageDetails
}: {
  imageDetails: CreateImageRequestV2
}) {
  const [currentImageId, setCurrentImageId] = useState('')
  const hasError = imageDetails.jobStatus === JobStatus.Error
  const isCensored = imageDetails.images_censored > 0
  const isDone = imageDetails.jobStatus === JobStatus.Done
  const inProgressHasImages = !isDone && imageDetails.finished > 0
  const isPendingOrProcessing = !isDone && !hasError
  const inProgressNoImages = !isDone && imageDetails.finished === 0

  // console.log(imageDetails)
  // console.log('inProgressHasImages', inProgressHasImages)
  console.log(`currentImageId?`, currentImageId)
  return (
    <div className="mt-4">
      {(isPendingOrProcessing ||
        inProgressNoImages ||
        hasError ||
        isCensored) && <ImageJobStatus imageDetails={imageDetails} />}
      {(isDone || inProgressHasImages) && (
        <>
          <ImageDisplay
            imageDetails={imageDetails}
            setCurrentImageId={setCurrentImageId}
          />
          <ImageOptions imageDetails={imageDetails} />
        </>
      )}
      <ImageDetails imageDetails={imageDetails} />
    </div>
  )
}
