import { memo } from 'react'
import { useRouter } from 'next/navigation'

import ProgressBar from './ProgressBar'
import { setNewImageReady, setShowImageReadyToast } from 'app/_store/appStore'
import { Button } from 'app/_components/Button'
import Panel from 'app/_components/Panel'
import { trackEvent, trackGaEvent } from 'app/_api/telemetry'
import { JobStatus } from '_types'
import { deletePendingJobFromApi } from 'app/_api/deletePendingJobFromApi'
import { savePrompt } from 'app/_utils/promptUtils'
import Linker from 'app/_components/Linker'
import { useStore } from 'statery'
import { modelStore } from 'app/_store/modelStore'
import { MODEL_LIMITED_BY_WORKERS, RATE_IMAGE_CUTOFF_SEC } from '_constants'
import DisplayRawData from 'app/_components/DisplayRawData'
import { copyEditPrompt } from 'app/_controllers/imageDetailsCommon'
import {
  deletePendingJob,
  updatePendingJobV2
} from 'app/_controllers/pendingJobsCache'
import styles from './pendingItem.module.css'
import clsx from 'clsx'
import ImageThumbnail from './ImageThumbnail'
import TooltipComponent from 'app/_components/TooltipComponent'
import {
  IconAlertTriangle,
  IconCopy,
  IconInfoHexagon,
  IconTrash,
  IconX
} from '@tabler/icons-react'

const RATINGS_ENABLED = false

interface IProps {
  handleCloseClick?: (jobId: string) => void
  jobDetails: any
  jobId: string
  onImageClick?: (jobId: string) => void
}

const PendingItem = memo(
  ({
    handleCloseClick = () => {},
    jobDetails,
    jobId,
    onImageClick = () => {}
  }: IProps) => {
    const router = useRouter()
    const modelState = useStore(modelStore)
    const { availableModels } = modelState

    const processDoneOrError =
      jobDetails?.jobStatus === JobStatus.Done ||
      jobDetails?.jobStatus === JobStatus.Error

    const serverHasJob =
      jobDetails?.jobStatus === JobStatus.Queued ||
      jobDetails?.jobStatus === JobStatus.Processing

    const handleDeleteJob = async () => {
      if (serverHasJob) {
        deletePendingJobFromApi(jobId)
      }

      trackEvent({
        event: 'DELETE_PENDING_JOB',
        context: '/pages/pending'
      })

      deletePendingJob(jobId)
    }

    const handleEditClick = async () => {
      savePrompt({ ...jobDetails })
      deletePendingJob(jobId)
      router.push(`/create?edit=true`)
    }

    const handleRetryJob = async () => {
      if (serverHasJob) {
        deletePendingJob(jobId)
      }

      updatePendingJobV2(
        Object.assign({}, jobDetails, { jobStatus: JobStatus.Waiting })
      )

      window.scrollTo(0, 0)
    }

    const clearNewImageNotification = () => {
      setShowImageReadyToast(false)
      setNewImageReady('')
    }

    const handleRemovePanel = () => {
      deletePendingJob(jobId)
      handleCloseClick(jobId)
    }

    const handleCopyPromptClick = (imageDetails: any) => {
      copyEditPrompt(imageDetails)
      router.push(`/create?edit=true`)
    }

    const timeDiff = jobDetails?.initWaitTime - jobDetails?.wait_time || 0
    let remainingTime = jobDetails?.initWaitTime - timeDiff || 0
    const elapsedTimeSec = Math.round(
      (Date.now() - jobDetails?.timestamp) / 1000
    )
    let pctComplete = Math.round(
      (elapsedTimeSec / jobDetails?.initWaitTime) * 100
    )

    if (isNaN(pctComplete)) {
      pctComplete = 0
    }

    if (pctComplete > 95) {
      pctComplete = 95
    }

    if (remainingTime <= 1) {
      remainingTime = 1
    }

    if (!jobDetails) {
      return null
    }

    const jobDone = jobDetails.jobStatus === JobStatus.Done
    const minJobWaitTime =
      4 * jobDetails.initWaitTime < 60 ? 60 : 4 * jobDetails.initWaitTime
    const jobStalled =
      elapsedTimeSec > minJobWaitTime && !jobDone && remainingTime < 3

    const currentTimestamp = Date.now() / 1000
    const jobTimestamp = jobDetails.timestamp / 1000

    const jobTimeDiff = currentTimestamp - jobTimestamp < RATE_IMAGE_CUTOFF_SEC
    const canRate = !jobDetails.userRating && jobDetails.shareImagesExternally

    const isPossible = jobDetails.is_possible

    return (
      <div className={styles.PendingItemWrapper}>
        <Panel
          style={{
            backgroundColor: 'var(--card-background)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {processDoneOrError ? (
            <div className={styles.CloseButton} onClick={handleRemovePanel}>
              <IconX width={28} color="white" />
            </div>
          ) : null}
          <div className={styles.InfoPanel}>
            <ImageThumbnail
              onImageClick={() => onImageClick(jobId)}
              jobDetails={jobDetails}
              serverHasJob={serverHasJob}
            />
            <div className="flex flex-col flex-grow">
              <div className={clsx('flex-grow', styles.Prompt)}>
                {jobDetails.models[0].includes('SDXL_beta') && (
                  <div
                    style={{
                      display: 'flex',
                      fontWeight: 700
                    }}
                  >
                    <IconInfoHexagon style={{ marginRight: '8px' }} />
                    SDXL beta{' '}
                    <TooltipComponent tooltipId="sdxl-beta-tooltip">
                      SDXL is currently in beta and provided by Stability.ai in
                      order to refine future image models. Please select one of
                      the following two images to choose as the best image for
                      this particular generation. You will be rewarded 15 kudos
                      for each rating.
                    </TooltipComponent>
                  </div>
                )}
                {jobDetails.upscaled && <div>[ UPSCALING ]</div>}
                <div
                  className="italic"
                  style={{
                    overflowWrap: 'break-word',
                    display: 'inline-block',
                    wordBreak: 'break-word'
                  }}
                >
                  {jobDetails.prompt}
                </div>
              </div>
              <div className="w-full mt-2 font-mono text-xs text-white">
                Steps: {jobDetails.steps}
                <br />
                Sampler: {jobDetails.sampler}
                <br />
                Model: {!jobDetails.models[0] ? 'Random' : jobDetails.models[0]}
                {availableModels[jobDetails.models[0]]?.count <=
                  MODEL_LIMITED_BY_WORKERS && (
                  <>
                    <div>
                      <div className={styles.ModelWarning}>
                        <IconAlertTriangle size={32} /> This model has limited
                        availability.
                        <br />
                        Images may take a long time to generate.
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className={styles.InfoPanel}>
            <DisplayRawData data={jobDetails} />
          </div>
          {jobDetails.jobStatus === JobStatus.Error ? (
            <div className="mt-2 font-mono text-xs text-red-400">
              <strong>Stable Horde API Error:</strong> &quot;
              {jobDetails.errorMessage}&quot;
              {jobDetails.errorMessage !==
                'The worker was unable to process this request. Try again?' &&
              jobDetails.errorMessage !==
                'Unable to create image. Please try again soon.' ? (
                <div>
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
              ) : null}
            </div>
          ) : null}
          {isPossible === false &&
          jobDetails.jobStatus !== JobStatus.Processing &&
          jobDetails.jobStatus !== JobStatus.Done ? (
            <div className="mt-2 font-mono text-xs text-amber-400">
              <strong>Warning:</strong> There are currently no workers available
              to process this image. You can continue to wait a few minutes for
              a worker to come online, or adjust your image settings (e.g.,
              model, dimensions or post processors) and try again.
            </div>
          ) : null}
          {jobStalled ? (
            <div className="mt-2 font-mono text-xs text-amber-400">
              <strong>Warning:</strong> Job seems to have stalled. This can
              happen if a worker goes offline or crashes without completing the
              request. You can automatically cancel and retry this request or
              continue to wait.
            </div>
          ) : null}
          <div className={styles.InfoDetails}>
            <div className="flex flex-col justify-end flex-grow">
              {jobDetails.jobStatus === JobStatus.Requested && (
                <div className="w-full mt-2 font-mono text-xs">
                  Image requested
                  <br />
                  Waiting for response...
                </div>
              )}
              {jobDetails.jobStatus === JobStatus.Queued && (
                <div className="w-full mt-2 font-mono text-xs">
                  Request queued{' '}
                  {isNaN(jobDetails.queue_position) ? null : (
                    <>(queue position: {jobDetails.queue_position})</>
                  )}
                  <br />
                  {isNaN(jobDetails.wait_time) ||
                  (jobDetails.wait_time === 0 && pctComplete === 0) ? (
                    'Estimating time remaining...'
                  ) : (
                    <>
                      Estimated time remaining: {jobDetails.wait_time}s (
                      {pctComplete.toFixed(0)}
                      %)
                    </>
                  )}
                </div>
              )}
              {jobDetails.jobStatus === JobStatus.Processing && (
                <div className="w-full mt-2 font-mono text-xs">
                  Processing
                  <br />
                  Estimated time remaining: {jobDetails.wait_time}s (
                  {pctComplete.toFixed(0)}
                  %)
                </div>
              )}
              {jobDetails.jobStatus === JobStatus.Waiting && (
                <div className="w-full mt-2 font-mono text-xs">
                  Waiting to submit image request
                  <br />
                  <br />
                </div>
              )}
              {(jobDetails.jobStatus === JobStatus.Waiting ||
                jobDetails.jobStatus === JobStatus.Queued ||
                jobDetails.jobStatus === JobStatus.Requested ||
                jobDetails.jobStatus === JobStatus.Processing) && (
                <div className="w-full font-mono text-xs">
                  Created: {new Date(jobDetails.timestamp).toLocaleString()}
                </div>
              )}
              {jobDetails.jobStatus === JobStatus.Done && (
                <div className="w-full font-mono text-xs">
                  Completed: {new Date(jobDetails.timestamp).toLocaleString()}
                </div>
              )}
              {jobDetails.jobStatus === JobStatus.Error && (
                <div className="mt-2 font-mono text-xs text-red-400">
                  Created: {new Date(jobDetails.jobTimestamp).toLocaleString()}
                </div>
              )}
            </div>
            <div className={styles.ButtonContainer}>
              {RATINGS_ENABLED &&
                jobDetails.jobStatus === JobStatus.Done &&
                jobTimeDiff &&
                canRate && (
                  <Button onClick={() => onImageClick(jobId)}>
                    Rate image
                  </Button>
                )}
              {jobDetails.jobStatus === JobStatus.Done && (
                <div className="flex flex-row gap-2">
                  <Button
                    title="Copy and re-edit prompt"
                    // @ts-ignore
                    onClick={() => handleCopyPromptClick(jobDetails)}
                  >
                    <IconCopy />
                    <span className="hidden md:inline-block">Copy</span>
                  </Button>
                  <Button
                    onClick={() => {
                      clearNewImageNotification()
                      trackEvent({
                        event: 'VIEW_IMAGE_BTN_CLICK',
                        context: '/pages/pending'
                      })
                      trackGaEvent({
                        action: 'pending_view_image_btn',
                        params: {
                          context: '/pages/pending'
                        }
                      })
                      router.push(`/image/${jobDetails.jobId}`)
                    }}
                  >
                    View
                  </Button>
                </div>
              )}
              {jobDetails.jobStatus !== JobStatus.Done && (
                <div className="flex flex-row gap-2">
                  {jobDetails.jobStatus === JobStatus.Error && (
                    <Button onClick={handleEditClick}>Edit</Button>
                  )}
                  {jobDetails.jobStatus === JobStatus.Error ||
                  jobDetails.jobStatus === JobStatus.Requested ||
                  jobStalled ? (
                    <Button onClick={handleRetryJob}>Retry?</Button>
                  ) : null}
                  <Button
                    title="Copy and re-edit prompt"
                    // @ts-ignore
                    onClick={() => handleCopyPromptClick(jobDetails)}
                  >
                    <IconCopy />
                    <span className="hidden md:inline-block">Copy</span>
                  </Button>
                  <Button theme="secondary" onClick={handleDeleteJob}>
                    <IconTrash />
                    <div className={styles.MobileHideText}>
                      {jobDetails.jobStatus === JobStatus.Error
                        ? 'Remove'
                        : 'Cancel'}
                    </div>
                  </Button>
                </div>
              )}
            </div>
          </div>
          {serverHasJob && (
            <div className={styles.ProgressBarPosition}>
              <ProgressBar pct={pctComplete} />
            </div>
          )}
          {jobDetails.jobStatus === JobStatus.Done && (
            <div className={styles.ProgressBarPosition}>
              <ProgressBar pct={100} />
            </div>
          )}
        </Panel>
      </div>
    )
  },
  arePropsEqual
)

function arePropsEqual(oldProps: any = {}, newProps: any = {}) {
  const { jobDetails: oldJobDetails = {} } = oldProps || {}
  const { jobDetails: newJobDetails = {} } = newProps || {}

  if (!oldJobDetails.jobId || !newJobDetails.jobId) {
    return false
  }

  return (
    oldJobDetails.jobId === newJobDetails.jobId &&
    oldJobDetails.jobStatus === newJobDetails.jobStatus &&
    oldJobDetails.ratingSubmitted === newJobDetails.ratingSubmitted &&
    oldJobDetails.wait_time === newJobDetails.wait_time &&
    oldJobDetails.initWaitTime === newJobDetails.initWaitTime
  )
}

PendingItem.displayName = 'PendingItem'
export default PendingItem
