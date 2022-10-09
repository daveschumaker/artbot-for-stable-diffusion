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

    setPendingImages(data)
    setIsInitialLoad(false)
  }

  const handleDeleteJob = async (jobId: string) => {
    await deletePendingJob(jobId)

    //TODO: Send API request
    fetchPrompts()
  }

  useEffect(() => {
    fetchPrompts()
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
