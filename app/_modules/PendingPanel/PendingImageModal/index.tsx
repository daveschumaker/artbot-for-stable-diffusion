import {
  IconAlertTriangle,
  IconLoader,
  IconPhotoUp,
  IconPlaylistAdd,
  IconPlaylistX,
  IconSettings,
  IconStackPush,
  IconTrash
} from '@tabler/icons-react'
import { JobStatus } from '_types'
import FlexCol from 'app/_components/FlexCol'
import FlexRow from 'app/_components/FlexRow'
import Linker from 'app/_components/Linker'
import clsx from 'clsx'
import styles from './pendingImageModal.module.css'
import { Button } from 'app/_components/Button'
import { deletePendingJobFromApi } from 'app/_api/deletePendingJobFromApi'
import { useState } from 'react'
import { updatePendingJobInDexieByJobId } from 'app/_utils/db'

const showDiscordBlurb = (errorMessage: string) => {
  if (
    errorMessage === 'The worker was unable to process this request. Try again?'
  ) {
    return false
  }

  if (errorMessage === 'Unable to create image. Please try again soon.') {
    return false
  }

  return true
}

export default function PendingImageModal({
  handleClose = () => {},
  imageDetails
}: {
  handleClose?: () => any
  imageDetails: any
}) {
  const [pendingJob] = useState<any>(imageDetails)

  // const getDetails = async() => {

  // }

  // useEffect(() => {

  // }, [])

  const serverHasJob =
    imageDetails?.jobStatus === JobStatus.Queued ||
    imageDetails?.jobStatus === JobStatus.Processing

  const handleRetryJob = async () => {
    await updatePendingJobInDexieByJobId(imageDetails.jobId, {
      jobStatus: JobStatus.Waiting
    })
    handleClose()
  }

  const handleDeleteJob = async () => {
    if (serverHasJob) {
      deletePendingJobFromApi(imageDetails.jobId)
    }

    handleClose()
  }

  return (
    <div style={{ marginTop: '4px' }}>
      {pendingJob.jobStatus === JobStatus.Processing && (
        <FlexCol className={styles.contrastTextBackground}>
          <FlexRow gap={8} pb={2}>
            <IconLoader size={32} stroke={1.5} /> <strong>Status:</strong> Image
            processing
          </FlexRow>
          {pendingJob.queue_position >= 0 && (
            <FlexRow pb={8}>
              <div style={{ fontSize: '14px' }}>
                Queue position: {pendingJob.queue_position} <br /> Est. wait:{' '}
                {pendingJob.wait_time} s
              </div>
            </FlexRow>
          )}
        </FlexCol>
      )}
      {pendingJob.is_possible === false && (
        <FlexCol className={styles.contrastTextBackground}>
          <FlexRow gap={8} pb={8}>
            <span>
              ⚠️ <strong>Warning:</strong> There are currently no workers
              available to process this image. You can continue to wait a few
              minutes for a worker to come online, or adjust your image settings
              (e.g., model, dimensions or post processors) and try again.
            </span>
          </FlexRow>
        </FlexCol>
      )}
      {(pendingJob.jobStatus === JobStatus.Requested ||
        pendingJob.jobStatus === JobStatus.Queued) && (
        <FlexCol className={styles.contrastTextBackground}>
          <FlexRow gap={8} pb={8}>
            <IconStackPush size={32} stroke={1.5} />
            <strong>Status:</strong> Image request submitted to AI Horde
          </FlexRow>
          {pendingJob.queue_position >= 0 && (
            <FlexRow pb={8}>
              <div style={{ fontSize: '14px' }}>
                Queue position: {pendingJob.queue_position} <br /> Est. wait:{' '}
                {pendingJob.wait_time} s
              </div>
            </FlexRow>
          )}
        </FlexCol>
      )}
      {pendingJob.jobStatus === JobStatus.Waiting && (
        <FlexCol className={styles.contrastTextBackground}>
          <FlexRow gap={8} pb={8}>
            <IconPhotoUp size={32} stroke={1.5} /> <strong>Status:</strong>{' '}
            Waiting to submit image request.
          </FlexRow>
        </FlexCol>
      )}
      {imageDetails.jobStatus === JobStatus.Error && (
        <FlexCol className={styles.contrastTextBackground}>
          <FlexRow gap={8} pb={8}>
            <IconAlertTriangle size={32} stroke={1.5} color="rgb(234 179 8)" />{' '}
            <strong>Error:</strong> {imageDetails.errorMessage}
          </FlexRow>
          {showDiscordBlurb(imageDetails.errorMessage) && (
            <FlexRow pb={8}>
              <div style={{ fontSize: '14px' }}>
                Not sure what this means? Please visit the{' '}
                <Linker
                  href="https://discord.gg/3DxrhksKzn"
                  target="_blank"
                  rel="noreferrer"
                >
                  Stable Horde Discord channel
                </Linker>{' '}
                for more further help and information.
              </div>
            </FlexRow>
          )}
        </FlexCol>
      )}
      <div></div>
      <div>
        <FlexCol style={{ marginBottom: '8px' }}>
          <FlexRow className="w-full text-sm font-bold flex flex-row gap-2 items-center">
            <IconPlaylistAdd stroke={1} />
            Prompt
          </FlexRow>
          <div className="w-full text-sm ml-[8px] break-words">
            {imageDetails.prompt}
          </div>
        </FlexCol>
        {imageDetails.negative && (
          <FlexCol style={{ marginBottom: '8px' }}>
            <FlexRow className="w-full text-sm font-bold flex flex-row gap-2 items-center">
              <IconPlaylistX stroke={1} />
              Negative prompt
            </FlexRow>
            <div className="w-full text-sm ml-[8px] break-words">
              {imageDetails.negative}
            </div>
          </FlexCol>
        )}
      </div>
      <div style={{ marginBottom: '8px' }}>
        <FlexRow className="w-full text-sm font-bold flex flex-row gap-2 items-center">
          <IconSettings stroke={1} />
          Image details
        </FlexRow>
        <div
          className={clsx([
            'bg-slate-800',
            'font-mono',
            'text-white',
            'text-sm',
            'overflow-x-auto',
            'mt-2',
            'mx-4',
            'rounded-md',
            'pt-4',
            'px-4'
          ])}
        >
          <ul>
            {imageDetails.timestamp && (
              <li>
                <strong>Created:</strong>{' '}
                {new Date(imageDetails.timestamp).toLocaleString()}
              </li>
            )}
            <li>
              <strong>Job ID:</strong> {imageDetails.jobId}
            </li>
            <li>&zwnj;</li>
            <li>
              <strong>Sampler:</strong> {imageDetails.sampler}
            </li>
            <li>
              <strong>Model:</strong>{' '}
              <Linker
                href={`/images?model=${imageDetails.models[0]}`}
                passHref
                className="text-cyan-500"
              >
                {imageDetails.models[0]}
              </Linker>
            </li>
            <li>&zwnj;</li>
            <li>
              <strong>Seed:</strong>{' '}
              {imageDetails.seed ? imageDetails.seed : '(random)'}
            </li>
            <li>
              <strong>Steps:</strong> {imageDetails.steps}
            </li>
            <li>
              <strong>Guidance / cfg scale:</strong> {imageDetails.cfg_scale}
            </li>
            <li>&zwnj;</li>
            <li>
              <strong>Height:</strong> {imageDetails.height}px
            </li>
            <li>
              <strong>Width:</strong> {imageDetails.width}px
            </li>
            <li>&zwnj;</li>
            <li>
              <strong>Karras:</strong> {imageDetails.karras ? 'true' : 'false'}
            </li>
            <li>
              <strong>Hi-res fix:</strong>{' '}
              {imageDetails.hires ? 'true' : 'false'}
            </li>
            <li>
              <strong>CLIP skip:</strong>{' '}
              {imageDetails.clipskip ? imageDetails.clipskip : 1}
            </li>
            <li>
              <strong>tiled:</strong> {imageDetails.tiling ? 'true' : 'false'}
            </li>
            <li>&zwnj;</li>
            {imageDetails.control_type && (
              <li>
                <strong>Control type:</strong> {imageDetails.control_type}
              </li>
            )}
            {imageDetails.image_is_control && (
              <li>
                <strong>Control map:</strong> {imageDetails.image_is_control}
              </li>
            )}
          </ul>
        </div>
        <FlexRow justifyContent="flex-end" mt={8} gap={8}>
          {imageDetails.jobStatus === JobStatus.Error && (
            <Button onClick={handleRetryJob}>
              <div className={styles.MobileHideText}>Retry</div>
            </Button>
          )}
          {(pendingJob.jobStatus === JobStatus.Waiting ||
            pendingJob.jobStatus === JobStatus.Queued ||
            imageDetails.jobStatus === JobStatus.Error) && (
            <Button theme="secondary" onClick={handleDeleteJob}>
              <IconTrash />
              <div className={styles.MobileHideText}>
                {imageDetails.jobStatus === JobStatus.Error
                  ? 'Remove'
                  : 'Cancel'}
              </div>
            </Button>
          )}
        </FlexRow>
      </div>
    </div>
  )
}
