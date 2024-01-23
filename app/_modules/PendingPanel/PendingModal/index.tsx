import { JobStatus } from '_types/artbot'
import CreateImageRequestV2 from 'app/_data-models/v2/CreateImageRequestV2'
import ImageDetails from './ImageDetails'
import ImageDisplay from './ImageDisplay'
import ImageJobStatus from './ImageJobStatus'

export default function PendingModal({
  imageDetails
}: {
  imageDetails: CreateImageRequestV2
}) {
  const hasError = imageDetails.jobStatus === JobStatus.Error
  const isCensored = false
  const isDone = imageDetails.jobStatus === JobStatus.Done
  const inProgressHasImages = !isDone && imageDetails.finished > 0
  const isPendingOrProcessing = !isDone && !hasError
  const inProgressNoImages = !isDone && imageDetails.finished === 0

  console.log(imageDetails)
  return (
    <div>
      {(isDone || inProgressHasImages) && (
        <ImageDisplay imageDetails={imageDetails} />
      )}
      {isPendingOrProcessing && <ImageJobStatus imageDetails={imageDetails} />}
      <ImageDetails imageDetails={imageDetails} />
    </div>
  )
}
