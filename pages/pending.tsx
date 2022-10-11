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
    fetch(`/artbot/api/delete-job`, {
      method: 'POST',
      body: JSON.stringify({
        id: jobId
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    await deletePendingJob(jobId)

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
    const timer5 = setTimeout(() => fetchPrompts(), 5000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
    }
  }, [])

  return (
    <div>
      <PageTitle>Your pending images</PageTitle>

      {isInitialLoad && <Spinner />}
      {!isInitialLoad && pendingImages.length === 0 && (
        <div className="mt-4 mb-2">
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
