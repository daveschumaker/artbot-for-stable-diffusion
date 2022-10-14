import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import {
  allPendingJobs,
  getImageDetails,
  getPendingJobDetails
} from '../utils/db'
import ProgressBar from './ProgressBar'
import Spinner from './Spinner'
import { setNewImageReady } from '../store/appStore'
import { Button } from './Button'
import TrashIcon from './icons/TrashIcon'
import Panel from './Panel'

// @ts-ignore
const PendingItem = ({ handleDeleteJob, jobDetails }) => {
  const router = useRouter()

  const [isComplete, setIsComplete] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [estimatedWait, setEstimatedWait] = useState(
    jobDetails?.wait_time || ''
  )

  const checkJobFinished = async () => {
    const jobFinished = await getImageDetails(jobDetails.jobId)

    if (jobFinished?.jobId === jobDetails?.jobId) {
      setIsComplete(true)
      setNewImageReady(true)
    }
  }

  const fetchCurrentJob = async () => {
    const pendingJobs = await allPendingJobs()
    const [currentJob] = pendingJobs

    if (currentJob?.jobId === jobDetails.jobId) {
      setIsProcessing(true)
    }
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isProcessing && jobDetails?.jobId) {
        const updatedJobDetails = await getPendingJobDetails(jobDetails.jobId)
        if (updatedJobDetails?.wait_time) {
          setEstimatedWait(updatedJobDetails.wait_time)
        }
      }
    }, 500)

    return () => clearInterval(interval)
  }, [isProcessing, jobDetails.jobId])

  useEffect(() => {
    fetchCurrentJob()
    checkJobFinished()

    const interval = setInterval(async () => {
      fetchCurrentJob()
      checkJobFinished()
    }, 2000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mb-2 relative border-0 border-b-2 border-dashed border-slate-500 pb-4">
      <Panel>
        <span className="italic text-gray-300">{jobDetails.prompt}</span>
        {!isComplete && isProcessing && (
          <div className="mt-4 mb-4">
            <ProgressBar time={jobDetails.wait_time} />
          </div>
        )}
        {isComplete && (
          <div className="mt-4 mb-4">
            <ProgressBar done />
          </div>
        )}
        <div className="mt-2 w-full flex flex-row items-center">
          <div className="w-3/4">
            {isComplete && (
              <Button
                onClick={() => {
                  setNewImageReady(false)
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
      </Panel>
    </div>
  )
}

export default PendingItem
