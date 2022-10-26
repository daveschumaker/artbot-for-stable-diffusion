import { useCallback, useEffect, useReducer, useState } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'

import { getImageDetails, getPendingJobDetails } from '../utils/db'
import ProgressBar from './ProgressBarV2'
import { setNewImageReady, setShowImageReadyToast } from '../store/appStore'
import { Button } from './Button'
import TrashIcon from './icons/TrashIcon'
import Panel from './Panel'
import { trackEvent, trackGaEvent } from '../api/telemetry'
import ImageSquare from './ImageSquare'
import Link from 'next/link'
import SpinnerV2 from './Spinner'
import PhotoUpIcon from './icons/PhotoUpIcon'
import AlertTriangleIcon from './icons/AlertTriangle'

interface JobDetails {
  jobId: string
  prompt: string
  jobStatus: string
  timestamp: number
  wait_time: number
}

const ImageWaiting = styled.div`
  align-items: center;
  background-color: ${(props) => props.theme.waitingImageBackground};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 4px;
  display: flex;
  justify-content: center;
  margin-right: 16px;
  height: 100px;
  width: 100px;
  min-width: 100px;
  min-height: 100px;
`

const ProgressBarPosition = styled.div`
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
`

const StyledPrompt = styled.div`
  color: ${(props) => props.theme.grayText};
`

// @ts-ignore
const PendingItem = ({ handleDeleteJob, jobId }) => {
  const router = useRouter()
  const [initialLoad, setInitialLoad] = useState(true)
  const [jobDetails, setJobDetails] = useState<JobDetails | undefined>(
    undefined
  )

  const [calcTime, setCalcTime] = useReducer(
    (state: any, newState: any) => ({ ...state, ...newState }),
    {
      pctComplete: 0,
      remainingTime: 0
    }
  )

  const clearNewImageNotification = () => {
    setShowImageReadyToast(false)
    setNewImageReady('')
  }

  const fetchJobDetails = useCallback(async () => {
    if (!jobId) {
      return
    }

    const pending = await getPendingJobDetails(jobId)
    if (pending) {
      setJobDetails(pending)
      setInitialLoad(false)
      return
    }

    const completed = await getImageDetails(jobId)

    if (completed) {
      setJobDetails(completed)
      setInitialLoad(false)
      return
    }
  }, [jobId])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!jobDetails) {
        return
      }

      const { jobStatus, timestamp, wait_time } = jobDetails

      if (!wait_time || jobStatus !== 'processing') {
        return
      }

      const initTime = timestamp / 1000
      const currentTimeSec = Date.now() / 1000
      const timeDiff = currentTimeSec - initTime

      let timeLeft = wait_time - timeDiff
      let pct = (timeDiff / wait_time) * 100

      if (pct > 95) {
        pct = 95
      }

      if (timeLeft < 1) {
        timeLeft = 1
      }

      setCalcTime({
        pctComplete: pct,
        remainingTime: Math.round(timeLeft)
      })
    }, 500)

    return () => clearInterval(interval)
  }, [jobDetails])

  useEffect(() => {
    const interval = setInterval(() => {
      // checkFinished()
      if (jobId) {
        fetchJobDetails()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [fetchJobDetails, jobId])

  if (initialLoad || !jobDetails) {
    return null
  }

  return (
    <div className="pb-4 mb-4 relative border-0 border-b-2 border-dashed border-slate-500 pb-4">
      <Panel className=" flex flex-row">
        <ImageWaiting>
          {jobDetails.jobStatus === 'processing' && <SpinnerV2 />}
          {jobDetails.jobStatus === 'done' && (
            <Link
              href={`/image/${jobId}`}
              onClick={() => {
                clearNewImageNotification()
              }}
            >
              <ImageSquare
                // @ts-ignore
                imageDetails={jobDetails}
                size={100}
              />
            </Link>
          )}
          {jobDetails.jobStatus === 'waiting' && <PhotoUpIcon size={48} />}
          {jobDetails.jobStatus === 'error' && (
            <AlertTriangleIcon size={48} stroke="rgb(234 179 8)" />
          )}
        </ImageWaiting>
        <div className="flex flex-col align-top flex-grow flex-wrap">
          <StyledPrompt className="italic flex-grow">
            {jobDetails.prompt}
          </StyledPrompt>
          <div className="mt-2 w-full flex flex-row items-center">
            <div className="flex flex-grow flex-col">
              {jobDetails.jobStatus === 'processing' && (
                <div className="w-full font-mono text-xs mt-2">
                  Estimated time remaining: {calcTime.remainingTime}s (
                  {calcTime.pctComplete.toFixed(0)}
                  %)
                </div>
              )}
              {jobDetails.jobStatus === 'waiting' && (
                <div className="w-full font-mono text-xs mt-2">
                  Image request queued
                </div>
              )}
              {(jobDetails.jobStatus === 'waiting' ||
                jobDetails.jobStatus === 'processing') && (
                <div className="w-full font-mono text-xs">
                  Created: {new Date(jobDetails.timestamp).toLocaleString()}
                </div>
              )}
              {jobDetails.jobStatus === 'error' && (
                <div className="font-mono text-xs mt-2 text-red-500">
                  Created: {new Date(jobDetails.timestamp).toLocaleString()}
                </div>
              )}
            </div>
            <div className="w-1/4 flex flex-row items-end justify-end">
              {jobDetails.jobStatus === 'done' && (
                <Button
                  onClick={() => {
                    clearNewImageNotification()
                    trackEvent({
                      event: 'VIEW_IMAGE_CLICK',
                      context: 'PendingItemsPage'
                    })
                    trackGaEvent({
                      action: 'pending_view_image_btn',
                      params: {
                        context: 'PendingItemsPage'
                      }
                    })
                    router.push(`/image/${jobDetails.jobId}`)
                  }}
                >
                  View
                </Button>
              )}
              {jobDetails.jobStatus !== 'done' && (
                <Button
                  btnType="secondary"
                  onClick={() => handleDeleteJob(jobId)}
                >
                  <TrashIcon />
                </Button>
              )}
            </div>
          </div>
        </div>
        {jobDetails.jobStatus === 'processing' && (
          <ProgressBarPosition>
            <ProgressBar pct={calcTime.pctComplete} />
          </ProgressBarPosition>
        )}
        {jobDetails.jobStatus === 'done' && (
          <ProgressBarPosition>
            <ProgressBar pct={100} />
          </ProgressBarPosition>
        )}
      </Panel>
    </div>
  )
}

export default PendingItem
