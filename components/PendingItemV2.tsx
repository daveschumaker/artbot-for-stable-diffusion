import { memo, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { useLiveQuery } from 'dexie-react-hooks'

import { db, deletePendingJobFromDb } from '../utils/db'
import ProgressBar from './ProgressBarV2'
import { setNewImageReady, setShowImageReadyToast } from '../store/appStore'
import { Button } from './UI/Button'
import TrashIcon from './icons/TrashIcon'
import Panel from './UI/Panel'
import { trackEvent, trackGaEvent } from '../api/telemetry'
import ImageSquare from './ImageSquare'
import Link from 'next/link'
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
`

const MobileHideText = styled.span`
  display: none;
  @media (min-width: 640px) {
    display: inline-block;
  }
`

const StyledImage = styled(ImageSquare)``

// @ts-ignore
const PendingItem = memo(({ jobDetails, jobId }) => {
  const router = useRouter()
  const processDoneOrError =
    jobDetails?.jobStatus === JobStatus.Done ||
    jobDetails?.jobStatus === JobStatus.Error

  const serverHasJob =
    jobDetails?.jobStatus === JobStatus.Queued ||
    jobDetails?.jobStatus === JobStatus.Processing

  const [hidePanel, setHidePanel] = useState(false)

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

    const clonedParams = new CreateImageRequest(jobDetails)
    clonedParams.useAllModels = false
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
    setHidePanel(true)
  }

  const timeDiff = jobDetails?.initWaitTime - jobDetails?.wait_time || 0
  let remainingTime = jobDetails?.initWaitTime - timeDiff || 0
  const elapsedTimeSec = Math.round((Date.now() - jobDetails?.timestamp) / 1000)
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

  useEffect(() => {
    return () => {
      if (jobDetails && jobDetails.jobStatus === JobStatus.Done) {
        deletePendingJobFromDb(jobDetails.jobId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!jobDetails || hidePanel) {
    return null
  }

  const jobDone = jobDetails.jobStatus === JobStatus.Done
  const minJobWaitTime =
    4 * jobDetails.initWaitTime < 60 ? 60 : 4 * jobDetails.initWaitTime
  const jobStalled =
    elapsedTimeSec > minJobWaitTime && !jobDone && remainingTime < 3

  return (
    <StyledContainer>
      <StyledPanel>
        {processDoneOrError ? (
          <StyledCloseButton onClick={handleRemovePanel}>
            <CloseIcon width={2} />
          </StyledCloseButton>
        ) : null}
        <StyledImageInfoPanel>
          <ImageWaiting>
            {serverHasJob || jobDetails.jobStatus === JobStatus.Requested ? (
              <SpinnerV2 />
            ) : null}
            {jobDetails.jobStatus === JobStatus.Done && (
              <Link
                href={`/image/${jobId}`}
                onClick={() => {
                  clearNewImageNotification()
                }}
              >
                <StyledImage
                  // @ts-ignore
                  imageDetails={jobDetails}
                  size={100}
                />
              </Link>
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
            <div className="w-full font-mono text-xs mt-2">
              Steps: {jobDetails.steps}
              <br />
              Sampler: {jobDetails.sampler}
              <br />
              Model: {!jobDetails.models[0] ? 'Random' : jobDetails.models[0]}
            </div>
          </div>
        </StyledImageInfoPanel>
        {jobDetails.jobStatus === JobStatus.Error ? (
          <div className="font-mono text-xs mt-2 text-red-400">
            <strong>Stable Horde API Error:</strong> {jobDetails.errorMessage}{' '}
            {jobDetails.errorMessage !==
            'Unable to create image. Please try again soon.' ? (
              <>
                Not sure what this means? Please visit the{' '}
                <Linker
                  href="https://discord.gg/3DxrhksKzn"
                  target="_blank"
                  rel="noreferrer"
                >
                  Stable Horde Discord channel
                </Linker>{' '}
                for more information.
              </>
            ) : null}
          </div>
        ) : null}
        {jobStalled ? (
          <div className="font-mono text-xs mt-2">
            <strong>Warning:</strong> Job seems to have stalled. This can happen
            if a worker goes offline or crashes without completing the request.
            You can automatically cancel and retry this request or continue to
            wait.
          </div>
        ) : null}
        <StyledInfoDiv>
          <div className="flex flex-grow flex-col justify-end">
            {jobDetails.jobStatus === JobStatus.Requested && (
              <div className="w-full font-mono text-xs mt-2">
                Image requested
                <br />
                Waiting for response...
              </div>
            )}
            {jobDetails.jobStatus === JobStatus.Queued && (
              <div className="w-full font-mono text-xs mt-2">
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
              <div className="w-full font-mono text-xs mt-2">
                Processing
                <br />
                Estimated time remaining: {jobDetails.wait_time}s (
                {pctComplete.toFixed(0)}
                %)
              </div>
            )}
            {jobDetails.jobStatus === JobStatus.Waiting && (
              <div className="w-full font-mono text-xs mt-2">
                Waiting to submit image request
                <br />
                <br />
              </div>
            )}
            {jobDetails.jobStatus === JobStatus.Done && (
              <div className="w-full font-mono text-xs mt-2">
                Image request complete
                <br />
                <br />
              </div>
            )}
            {(jobDetails.jobStatus === JobStatus.Done ||
              jobDetails.jobStatus === JobStatus.Waiting ||
              jobDetails.jobStatus === JobStatus.Queued ||
              jobDetails.jobStatus === JobStatus.Requested ||
              jobDetails.jobStatus === JobStatus.Processing) && (
              <div className="w-full font-mono text-xs">
                Created: {new Date(jobDetails.timestamp).toLocaleString()}
              </div>
            )}
            {jobDetails.jobStatus === JobStatus.Error && (
              <div className="font-mono text-xs mt-2 text-red-400">
                Created: {new Date(jobDetails.timestamp).toLocaleString()}
              </div>
            )}
          </div>
          <StyledButtonContainer>
            {jobDetails.jobStatus === JobStatus.Done && (
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
            )}
            {jobDetails.jobStatus !== JobStatus.Done && (
              <div className="flex flex-row gap-2">
                {jobDetails.jobStatus === JobStatus.Error && (
                  <Button onClick={handleEditClick}>Edit</Button>
                )}
                {jobDetails.jobStatus === JobStatus.Error || jobStalled ? (
                  <Button onClick={handleRetryJob}>Retry?</Button>
                ) : null}
                {jobDetails.jobStatus !== JobStatus.Processing || jobStalled ? (
                  <Button btnType="secondary" onClick={handleDeleteJob}>
                    <TrashIcon />
                    <MobileHideText>
                      {jobDetails.jobStatus === JobStatus.Error
                        ? 'Remove'
                        : 'Cancel'}
                    </MobileHideText>
                  </Button>
                ) : null}
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
})

PendingItem.displayName = 'PendingItem'
export default PendingItem
