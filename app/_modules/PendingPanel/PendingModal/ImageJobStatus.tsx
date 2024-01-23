import CreateImageRequestV2 from 'app/_data-models/v2/CreateImageRequestV2'
import FlexCol from 'app/_components/FlexCol'
import styles from './pendingModal.module.css'
import { JobStatus } from '_types/artbot'
import FlexRow from 'app/_components/FlexRow'
import { IconLoader, IconPhotoUp, IconStackPush } from '@tabler/icons-react'

export default function ImageJobStatus({
  imageDetails
}: {
  imageDetails: CreateImageRequestV2
}) {
  console.log(`imageDetails`, imageDetails)
  return (
    <div className="mb-2">
      <FlexCol className={styles.contrastTextBackground}>
        {imageDetails.jobStatus === JobStatus.Processing && (
          <>
            <FlexRow gap={8} pb={2}>
              <IconLoader size={28} stroke={1.5} /> <strong>Status:</strong>{' '}
              Image{imageDetails.numImages > 1 ? 's' : ''} processing
            </FlexRow>
            {imageDetails.queue_position >= 0 && imageDetails.numImages > 1 && (
              <FlexRow pb={8}>
                <div style={{ fontSize: '14px' }}>
                  Images completed: {imageDetails.finished} of{' '}
                  {imageDetails.numImages}
                </div>
              </FlexRow>
            )}
          </>
        )}
        {imageDetails.is_possible === false && (
          <FlexCol className={styles.contrastTextBackground}>
            <FlexRow gap={8} pb={8}>
              <span>
                <strong>Warning:</strong> There are currently no workers
                available to process this image. You can continue to wait a few
                minutes for a worker to come online, or adjust your image
                settings (e.g., model, dimensions or post processors) and try
                again.
              </span>
            </FlexRow>
          </FlexCol>
        )}
        {(imageDetails.jobStatus === JobStatus.Requested ||
          imageDetails.jobStatus === JobStatus.Queued) && (
          <FlexCol className={styles.contrastTextBackground}>
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
          </FlexCol>
        )}
        {imageDetails.jobStatus === JobStatus.Waiting && (
          <FlexCol className={styles.contrastTextBackground}>
            <FlexRow gap={8} pb={8}>
              <IconPhotoUp size={32} stroke={1.5} /> <strong>Status:</strong>{' '}
              Waiting to submit image request to the AI Horde.
            </FlexRow>
          </FlexCol>
        )}
        {/* TODO: Handle Error state and censored status */}
      </FlexCol>
    </div>
  )
}
