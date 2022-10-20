import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import {
  allPendingJobs,
  getImageDetails,
  getPendingJobDetails
} from '../utils/db'
import ProgressBar from './ProgressBar'
import Spinner from './Spinner'
import {
  appInfoStore,
  setNewImageReady,
  setShowImageReadyToast
} from '../store/appStore'
import { Button } from './Button'
import TrashIcon from './icons/TrashIcon'
import Panel from './Panel'
import { trackEvent, trackGaEvent } from '../api/telemetry'
import { useStore } from 'statery'
import ImageSquare from './ImageSquare'
import Link from 'next/link'

// @ts-ignore
const PendingItem = ({ handleDeleteJob, jobDetails }) => {
  const router = useRouter()
  const appState = useStore(appInfoStore)
  const { showImageReadyToast } = appState

  const [imageDetails, setImageDetails] = useState({})
  const [isComplete, setIsComplete] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [estimatedWait, setEstimatedWait] = useState(
    jobDetails?.wait_time || ''
  )

  const clearNewImageNotification = () => {
    setShowImageReadyToast(false)
    setNewImageReady('')
  }

  const handleShowToast = useCallback(() => {
    if (!showImageReadyToast) {
      setNewImageReady(jobDetails.jobId)
      setShowImageReadyToast(true)
    }
  }, [jobDetails.jobId, showImageReadyToast])

  const checkJobFinished = useCallback(async () => {
    if (isComplete) {
      return
    }

    const jobFinished = await getImageDetails(jobDetails.jobId)

    if (jobFinished?.jobId === jobDetails?.jobId) {
      handleShowToast()
      setIsComplete(true)
      setImageDetails(jobFinished)
    }
  }, [handleShowToast, isComplete, jobDetails?.jobId])

  const fetchCurrentJob = useCallback(async () => {
    if (isComplete) {
      return
    }

    const pendingJobs = await allPendingJobs()
    const [currentJob] = pendingJobs

    if (currentJob?.jobId === jobDetails.jobId) {
      setIsProcessing(true)
    }
  }, [isComplete, jobDetails?.jobId])

  useEffect(() => {
    fetchCurrentJob()
    const pendingInterval = setInterval(async () => {
      if (isComplete) {
        return
      }

      if (isProcessing && jobDetails?.jobId) {
        const updatedJobDetails = await getPendingJobDetails(jobDetails.jobId)
        if (updatedJobDetails?.wait_time) {
          setEstimatedWait(updatedJobDetails.wait_time)
        }
      }
    }, 1000)

    const completedInterval = setInterval(async () => {
      await fetchCurrentJob()
    }, 2000)

    return () => {
      clearInterval(pendingInterval)
      clearInterval(completedInterval)
    }
  }, [fetchCurrentJob, isComplete, isProcessing, jobDetails.jobId])

  useEffect(() => {
    checkJobFinished()

    const completedInterval = setInterval(async () => {
      await checkJobFinished()
    }, 2500)

    return () => {
      clearInterval(completedInterval)
    }
  }, [checkJobFinished])

  return (
    <div className="pb-4 mb-4 relative border-0 border-b-2 border-dashed border-slate-500 pb-4">
      <Panel className=" flex flex-row">
        {isComplete && (
          <div className="flex min-w-[100px] w-[100px] mr-3 cursor-pointer">
            <Link href={`/image/${jobDetails.jobId}`} passHref>
              <a
                onClick={() => {
                  trackEvent({
                    event: 'VIEW_IMAGE_CLICK',
                    context: 'PendingItemsPage'
                  })
                  clearNewImageNotification()
                }}
              >
                <ImageSquare
                  // @ts-ignore
                  imageDetails={imageDetails}
                  imageType="image/webp"
                />
              </a>
            </Link>
          </div>
        )}
        <div className="flex flex-col align-top grow flex-wrap">
          <span className="italic text-gray-300">{jobDetails.prompt}</span>
          {!isComplete && isProcessing && (
            <div className="mt-4 mb-2">
              <ProgressBar time={jobDetails.wait_time} />
            </div>
          )}
          {isComplete && (
            <div className="mt-3 mb-3">
              <ProgressBar done />
            </div>
          )}
          <div className="mt-2 w-full flex flex-row items-center">
            <div className="w-3/4">
              {isComplete && (
                <Button
                  onClick={() => {
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
                    clearNewImageNotification()
                    router.push(`/image/${jobDetails.jobId}`)
                  }}
                >
                  View image
                </Button>
              )}
              {!isComplete && isProcessing && (
                <div className="font-mono text-xs mt-2">
                  {estimatedWait >= 1
                    ? `Estimated time remaining: ${estimatedWait} seconds`
                    : 'Estimating wait...'}
                </div>
              )}
              {!isComplete && (
                <div className="font-mono text-xs mt-2">
                  Created: {new Date(jobDetails.timestamp).toLocaleString()}
                </div>
              )}
            </div>
            <div className="w-1/4 flex flex-row items-center justify-end">
              {!isComplete && isProcessing && (
                <div className="inline-block mt-1">
                  <Spinner />
                </div>
              )}
              {!isComplete && (
                <Button
                  btnType="secondary"
                  onClick={() => handleDeleteJob(jobDetails.jobId)}
                >
                  <TrashIcon />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  )
}

export default PendingItem
