import { useEffect, useState } from 'react'

import PageTitle from '../components/PageTitle'
import Spinner from '../components/Spinner'
import { allPendingJobs, deletePendingJobFromDb } from '../utils/db'
import PendingItem from '../components/PendingItemV2'
import { trackEvent } from '../api/telemetry'
import Head from 'next/head'
import { deletePendingJobFromApi } from '../api/deletePendingJobFromApi'
import Linker from '../components/Linker'

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
    deletePendingJobFromApi(jobId)
    await deletePendingJobFromDb(jobId)
    trackEvent({
      event: 'DELETE_PENDING_JOB',
      context: 'PendingItemsPage'
    })

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
      <Head>
        <title>ArtBot - Pending images</title>
      </Head>
      <PageTitle>Your pending images</PageTitle>

      {isInitialLoad && <Spinner />}
      {!isInitialLoad && pendingImages.length === 0 && (
        <div className="mt-4 mb-2">
          No images pending.{' '}
          <Linker href="/" className="text-cyan-400">
            Why not create something?
          </Linker>
        </div>
      )}
      {!isInitialLoad &&
        pendingImages.length > 0 &&
        pendingImages.map((job: { jobId: string; prompt: string }) => {
          return (
            <PendingItem
              handleDeleteJob={handleDeleteJob}
              jobId={job.jobId}
              key={job.jobId}
            />
          )
        })}
    </div>
  )
}

export default PendingPage
