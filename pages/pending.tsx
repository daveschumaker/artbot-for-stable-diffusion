import { useEffect, useState } from 'react'
import Link from 'next/link'

import PageTitle from '../components/PageTitle'
import Spinner from '../components/Spinner'
import { allPendingJobs, deletePendingJob } from '../utils/db'
import PendingItem from '../components/PendingItem'

const PendingPage = () => {
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [pendingImages, setPendingImages] = useState([])

  const fetchPrompts = async () => {
    const data = await allPendingJobs()

    setIsInitialLoad(false)
    setPendingImages(data)
    return data
  }

  const handleDeleteJob = async (jobId: string) => {
    await deletePendingJob(jobId)

    //TODO: Send API request
    fetchPrompts()
  }

  useEffect(() => {
    fetchPrompts()

    // Ridiculously hacky way to check for multi images in the queue
    // TODO: Fix me.
    const timer1 = setTimeout(() => fetchPrompts(), 500)
    const timer2 = setTimeout(() => fetchPrompts(), 1000)
    const timer3 = setTimeout(() => fetchPrompts(), 1500)
    const timer4 = setTimeout(() => fetchPrompts(), 2500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [])

  return (
    <div>
      <PageTitle>Your pending images</PageTitle>

      {isInitialLoad && <Spinner />}
      {!isInitialLoad && pendingImages.length === 0 && (
        <div>
          No images pending.{' '}
          <Link href="/">
            <a className="text-cyan-400">Why not create something?</a>
          </Link>
        </div>
      )}
      {!isInitialLoad &&
        pendingImages.length > 0 &&
        pendingImages.map((job: { jobId: string; prompt: string }) => {
          return (
            <PendingItem
              handleDeleteJob={handleDeleteJob}
              jobDetails={job}
              key={job.jobId}
            />
          )
        })}
    </div>
  )
}

export default PendingPage
