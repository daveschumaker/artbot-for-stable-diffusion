import { useContext } from 'react'
import CreateImageRequestV2 from 'app/_data-models/v2/CreateImageRequestV2'
import ImageDetails from './ImageDetails'
import ImageDisplay from './ImageDisplay'
import ImageJobStatus from './ImageJobStatus'
import ImageOptions from './ImageOptions'
import { ImageDetailsProvider } from './ImageDetailsProvider'

/**
 *
 * TODO:
 * - Add check for isPending modal (vs normal image gallery modal)
 * - Image Options should handle imageId specific stuff
 * - On delete, check if there are no images. If not, delete entire job
 * - For failed pending job, add options to retry / edit modal
 */

export default function PendingModal({
  imageDetails
}: {
  imageDetails: CreateImageRequestV2
}) {
  return (
    <ImageDetailsProvider imageDetails={imageDetails}>
      <div className="mt-4">
        <ImageJobStatus />
        <ImageDisplay />
        <ImageOptions />
        <ImageDetails />
      </div>
    </ImageDetailsProvider>
  )
}
