import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import { allPendingJobs, getImageDetails } from '../utils/db'
import ProgressBar from './ProgressBar'
import { setHasNewImage } from '../utils/imageCache'
import Spinner from './Spinner'

// @ts-ignore
const PendingItem = ({ handleDeleteJob, jobDetails }) => {
  const router = useRouter()

  const [isComplete, setIsComplete] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const checkJobFinished = async () => {
    const jobFinished = await getImageDetails(jobDetails.jobId)

    if (jobFinished?.jobId === jobDetails?.jobId) {
      setIsComplete(true)
      setHasNewImage(true)
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
    <div className="mb-2 relative border-0 border-b-2 border-dashed border-slate-500 pt-4 pb-4 font-mono">
      {jobDetails.prompt}
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
      <div className="mt-2 w-full table">
        <div className="inline-block w-3/4 align-bottom">
          {isComplete && (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded align-top"
              onClick={() => {
                setHasNewImage(false)
                router.push(`/image/${jobDetails.jobId}`)
              }}
            >
              View image
            </button>
          )}
          <div className="content-end">
            {!isComplete && isProcessing && (
              <div className="font-mono text-xs mt-2">
                Estimated wait: {jobDetails.wait_time} seconds
              </div>
            )}
            {!isComplete && (
              <div className="font-mono text-xs mt-2">
                Created: {new Date(jobDetails.timestamp).toLocaleString()}
              </div>
            )}
          </div>
        </div>
        <div className="inline-block w-1/4 text-right">
          {!isComplete && isProcessing && (
            <div className="inline-block mt-1">
              <Spinner />
            </div>
          )}
          {!isComplete && (
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold rounded ml-2 h-[40px] w-[40px] align-top"
              onClick={() => handleDeleteJob(jobDetails.jobId)}
            >
              X
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PendingItem
