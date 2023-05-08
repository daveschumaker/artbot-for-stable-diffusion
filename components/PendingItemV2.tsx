import { memo } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'

import { deletePendingJobFromDb } from '../utils/db'
import ProgressBar from './ProgressBarV2'
import { setNewImageReady, setShowImageReadyToast } from '../store/appStore'
import { Button } from './UI/Button'
import TrashIcon from './icons/TrashIcon'
import Panel from './UI/Panel'
import { trackEvent, trackGaEvent } from '../api/telemetry'
import ImageSquare from './ImageSquare'
import SpinnerV2 from './Spinner'
import PhotoUpIcon from './icons/PhotoUpIcon'
import AlertTriangleIcon from './icons/AlertTriangle'
import { JobStatus } from '../types'
import CloseIcon from './icons/CloseIcon'
import { deletePendingJobFromApi } from '../api/deletePendingJobFromApi'
import { createImageJob } from '../utils/imageCache'
import { savePrompt } from '../utils/promptUtils'
import CreateImageRequest from '../models/CreateImageRequest'
import Linker from './UI/Linker'
import { useStore } from 'statery'
import { modelInfoStore } from '../store/modelStore'
import { MODEL_LIMITED_BY_WORKERS, RATE_IMAGE_CUTOFF_SEC } from '../_constants'
import DisplayRawData from './DisplayRawData'
import CopyIcon from './icons/CopyIcon'
import { copyEditPrompt } from '../controllers/imageDetailsCommon'

const RATINGS_ENABLED = false

const ModelWarning = styled.div`
  align-items: center;
  color: #facc15;
  column-gap: 4px;
  display: flex;
  font-size: 12px;
  flex-direction: row;
  margin-bottom: 4px;
  margin-top: 4px;
`

const StyledContainer = styled.div`
  box-shadow: 0 3px 10px rgb(0 0 0 / 0.2);
  position: relative;
  margin-bottom: 16px;
`

const StyledPanel = styled(Panel)`
  background-color: ${(props) => props.theme.cardBackground};
  display: flex;
  flex-direction: column;
`

const StyledCloseButton = styled.div`
  cursor: pointer;
  position: absolute;
  top: 8px;
  right: 8px;

  @media (min-width: 640px) {
    right: 16px;
  }
`

const ImageWaiting = styled.div`
  align-items: center;
  background-color: ${(props) => props.theme.waitingImageBackground};
  border-radius: 4px;
  display: flex;
  justify-content: center;
  margin-right: 16px;
  height: 100px;
  width: 100px;
  min-width: 100px;
  min-height: 100px;
  box-shadow: 0 16px 38px -12px rgb(0 0 0 / 56%),
    0 4px 25px 0px rgb(0 0 0 / 12%), 0 8px 10px -5px rgb(0 0 0 / 20%);
`

const ProgressBarPosition = styled.div`
  position: absolute;
  bottom: 0px;
  left: 0;
  right: 0;
`

const StyledImageInfoPanel = styled.div`
  display: flex;
  flex-direction: row;
`

const StyledPrompt = styled.div`
  color: ${(props) => props.theme.grayText};
  margin-right: 24px;
`

const StyledInfoDiv = styled.div`
  color: ${(props) => props.theme.grayText};
  display: flex;
  flex-direction: row;
  margin-top: 8px;
`

const StyledButtonContainer = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  justify-content: flex-end;
  column-gap: 8px;
`

const MobileHideText = styled.span`
  display: none;
  @media (min-width: 640px) {
    display: inline-block;
  }
`

const ImageContainer = styled.div`
  cursor: pointer;
`

const StyledImage = styled(ImageSquare)``

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
    const modelState = useStore(modelInfoStore)
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

      deletePendingJobFromDb(jobId)
    }

    const handleEditClick = async () => {
      await deletePendingJobFromDb(jobId)
      savePrompt({ ...jobDetails })
      router.push(`/?edit=true`)
    }

    const handleRetryJob = async () => {
      if (serverHasJob) {
        deletePendingJobFromApi(jobId)
      }

      // Fixes https://github.com/daveschumaker/artbot-for-stable-diffusion/issues/23
      jobDetails.orientationType = jobDetails.orientation

      const clonedParams = new CreateImageRequest(jobDetails)
      clonedParams.useAllModels = false
      clonedParams.useAllSamplers = false
      clonedParams.numImages = 1

      trackEvent({
        event: 'RETRY_JOB',
        context: '/pages/pending'
      })

      await createImageJob(clonedParams)
      await deletePendingJobFromDb(jobId)
      window.scrollTo(0, 0)
    }

    const clearNewImageNotification = () => {
      setShowImageReadyToast(false)
      setNewImageReady('')
    }

    const handleRemovePanel = () => {
      deletePendingJobFromDb(jobId)
      handleCloseClick(jobId)
    }

    const handleCopyPromptClick = (imageDetails: any) => {
      copyEditPrompt(imageDetails)
      router.push(`/?edit=true`)
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
      <StyledContainer>
        <StyledPanel>
          {processDoneOrError ? (
            <StyledCloseButton onClick={handleRemovePanel}>
              <CloseIcon width={2} stroke="white" />
            </StyledCloseButton>
          ) : null}
          <StyledImageInfoPanel>
            <ImageWaiting>
              {serverHasJob || jobDetails.jobStatus === JobStatus.Requested ? (
                <SpinnerV2 />
              ) : null}
              {jobDetails.jobStatus === JobStatus.Done && (
                <ImageContainer onClick={() => onImageClick(jobId)}>
                  <StyledImage
                    // @ts-ignore
                    imageDetails={jobDetails}
                    size={100}
                  />
                </ImageContainer>
              )}
              {jobDetails.jobStatus === JobStatus.Waiting && (
                <PhotoUpIcon size={48} />
              )}
              {jobDetails.jobStatus === JobStatus.Error && (
                <AlertTriangleIcon size={48} stroke="rgb(234 179 8)" />
              )}
            </ImageWaiting>
            <div className="flex flex-col flex-grow">
              <StyledPrompt className="flex-grow">
                {jobDetails.upscaled && <div>[ UPSCALING ]</div>}
                <div className="italic">{jobDetails.prompt}</div>
              </StyledPrompt>
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
                      <ModelWarning>
                        <AlertTriangleIcon size={32} /> This model has limited
                        availability.
                        <br />
                        Images may take a long time to generate.
                      </ModelWarning>
                    </div>
                  </>
                )}
              </div>
            </div>
          </StyledImageInfoPanel>
          <StyledImageInfoPanel>
            <DisplayRawData data={jobDetails} />
          </StyledImageInfoPanel>
          {jobDetails.jobStatus === JobStatus.Error ? (
            <div className="mt-2 font-mono text-xs text-red-400">
              <strong>Stable Horde API Error:</strong> &quot;
              {jobDetails.errorMessage}&quot;
              {jobDetails.errorMessage !==
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
          {isPossible === false ? (
            <div className="mt-2 font-mono text-xs text-amber-400">
              <strong>Warning:</strong> There are currently no workers available
              to process this image. You can continue to wait for a worker to
              come online, or adjust your image settings (e.g., dimensions or
              post processors) and try again.
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
          <StyledInfoDiv>
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
              {jobDetails.jobStatus === JobStatus.Done && (
                <div className="w-full mt-2 font-mono text-xs">
                  Image request complete
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
            <StyledButtonContainer>
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
                    <CopyIcon />
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
                    <CopyIcon />
                    <span className="hidden md:inline-block">Copy</span>
                  </Button>
                  <Button theme="secondary" onClick={handleDeleteJob}>
                    <TrashIcon />
                    <MobileHideText>
                      {jobDetails.jobStatus === JobStatus.Error
                        ? 'Remove'
                        : 'Cancel'}
                    </MobileHideText>
                  </Button>
                </div>
              )}
            </StyledButtonContainer>
          </StyledInfoDiv>
          {serverHasJob && (
            <ProgressBarPosition>
              <ProgressBar pct={pctComplete} />
            </ProgressBarPosition>
          )}
          {jobDetails.jobStatus === JobStatus.Done && (
            <ProgressBarPosition>
              <ProgressBar pct={100} />
            </ProgressBarPosition>
          )}
        </StyledPanel>
      </StyledContainer>
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
    oldJobDetails.wait_time === newJobDetails.wait_time &&
    oldJobDetails.initWaitTime === newJobDetails.initWaitTime
  )
}

PendingItem.displayName = 'PendingItem'
export default PendingItem
