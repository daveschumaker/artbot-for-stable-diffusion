import FlexCol from 'app/_components/FlexCol'
import styles from './imageModal.module.css'
import { JobStatus } from '_types/artbot'
import FlexRow from 'app/_components/FlexRow'
import {
  IconAlertTriangle,
  IconLoader,
  IconPhotoUp,
  IconStackPush
} from '@tabler/icons-react'
import { useContext } from 'react'
import { ImageDetailsContext } from './ImageDetailsProvider'
import { Button } from 'app/_components/Button'
import { updatePendingJobV2 } from 'app/_controllers/pendingJobsCache'
import NiceModal from '@ebay/nice-modal-react'

export default function ImageJobStatus() {
  const context = useContext(ImageDetailsContext)
  const {
    imageDetails,
    isPendingOrProcessing,
    inProgressNoImages,
    hasError,
    isCensored
  } = context

  const jobHasError =
    imageDetails.numImages === imageDetails.images_censored ||
    imageDetails.jobStatus === JobStatus.Error
  const showComponent =
    isPendingOrProcessing || inProgressNoImages || hasError || isCensored

  if (!showComponent) return null

  return (
    <div className="mb-2">
      <FlexCol className={styles.contrastTextBackground}>
        {imageDetails.jobStatus === JobStatus.Done &&
          imageDetails.images_censored > 0 && (
            <>
              <FlexRow gap={8} pb={2}>
                <IconAlertTriangle
                  size={28}
                  stroke={1.5}
                  color="rgb(234 179 8)"
                />{' '}
                Encountered issue processing images. The worker GPU was unable
                to complete this request. Try again?
              </FlexRow>
              {imageDetails.queue_position >= 0 &&
                imageDetails.numImages > 1 && (
                  <FlexCol pb={8}>
                    <div style={{ fontSize: '14px' }}>
                      Images completed:{' '}
                      {imageDetails.finished - imageDetails.images_censored} of{' '}
                      {imageDetails.numImages}
                    </div>
                    {imageDetails.images_censored > 0 && (
                      <div style={{ fontSize: '14px' }}>
                        Images failed: {imageDetails.images_censored}
                      </div>
                    )}
                  </FlexCol>
                )}
            </>
          )}
        {imageDetails.jobStatus === JobStatus.Processing && (
          <>
            <FlexRow gap={8} pb={2}>
              <IconLoader size={28} stroke={1.5} /> <strong>Status:</strong>{' '}
              Image{imageDetails.numImages > 1 ? 's' : ''} processing
            </FlexRow>
            {imageDetails.queue_position >= 0 && imageDetails.numImages > 1 && (
              <FlexCol pb={8}>
                <div style={{ fontSize: '14px' }}>
                  Images completed:{' '}
                  {imageDetails.finished - imageDetails.images_censored} of{' '}
                  {imageDetails.numImages}
                </div>
                {imageDetails.images_censored > 0 && (
                  <div style={{ fontSize: '14px' }}>
                    Images failed: {imageDetails.images_censored}
                  </div>
                )}
              </FlexCol>
            )}
          </>
        )}
        {imageDetails.is_possible === false && (
          <FlexRow gap={8} pb={8}>
            <span>
              <strong>Warning:</strong> There are currently no workers available
              to process this image. You can continue to wait a few minutes for
              a worker to come online, or adjust your image settings (e.g.,
              model, dimensions or post processors) and try again.
            </span>
          </FlexRow>
        )}
        {imageDetails.jobStatus === JobStatus.Error && (
          <>
            <FlexRow gap={8} pb={8}>
              <IconAlertTriangle
                size={28}
                stroke={1.5}
                color="rgb(234 179 8)"
              />{' '}
              <strong>Warning:</strong> {imageDetails.errorMessage}
            </FlexRow>
            {imageDetails.numImages > 1 && (
              <FlexRow pb={8}>
                <div style={{ fontSize: '14px' }}>
                  Images completed: {imageDetails.finished} of{' '}
                  {imageDetails.numImages}
                </div>
              </FlexRow>
            )}
          </>
        )}
        {(imageDetails.jobStatus === JobStatus.Requested ||
          imageDetails.jobStatus === JobStatus.Queued) && (
          <>
            <FlexRow gap={8} pb={8}>
              <IconStackPush size={32} stroke={1.5} />
              <strong>Status:</strong> Image request submitted to AI Horde
            </FlexRow>
            {imageDetails.queue_position >= 0 && (
              <FlexRow pb={8}>
                <div style={{ fontSize: '14px' }}>
                  Queue position: {imageDetails.queue_position} <br /> Est.
                  wait: {imageDetails.wait_time} s
                </div>
              </FlexRow>
            )}
          </>
        )}
        {imageDetails.jobStatus === JobStatus.Waiting && (
          <>
            <FlexRow gap={8} pb={8}>
              <IconPhotoUp size={32} stroke={1.5} /> <strong>Status:</strong>{' '}
              Waiting to submit image request to the AI Horde.
            </FlexRow>
          </>
        )}
        {/* TODO: Handle Error state and censored status */}
        {jobHasError && (
          <div className="flex flex-row justify-end gap-2 w-full mb-4">
            <Button
              onClick={async () => {
                await updatePendingJobV2(
                  Object.assign({}, imageDetails, {
                    errorMessage: '',
                    errorStatus: '',
                    jobStatus: JobStatus.Waiting,
                    images_censored: 0
                  })
                )
                NiceModal.remove('image-modal')
              }}
            >
              Retry?
            </Button>
          </div>
        )}
      </FlexCol>
    </div>
  )
}
