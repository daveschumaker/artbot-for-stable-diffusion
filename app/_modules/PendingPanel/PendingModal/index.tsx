import { useState } from 'react'
import { JobStatus } from '_types/artbot'
import CreateImageRequestV2 from 'app/_data-models/v2/CreateImageRequestV2'
import ImageDetails from './ImageDetails'
import ImageDisplay from './ImageDisplay'
import ImageJobStatus from './ImageJobStatus'
import ImageOptions from './ImageOptions'

/**
 *
 * TODO:
 * - Add check for isPending modal (vs normal image gallery modal)
 * - Image Options should handle imageId specific stuff
 * - On delete, check if there are no images. If not, delete entire job
 * - For failed pending job, add options to retry / edit modal
 *
 */

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

  const censoredJob = imageDetails.numImages === imageDetails.images_censored

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
        </>
      )}
      {currentImageId && (
        <ImageOptions imageDetails={imageDetails} imageId={currentImageId} />
      )}
      <ImageDetails imageDetails={imageDetails} />
    </div>
  )
}
