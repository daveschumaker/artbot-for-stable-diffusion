import { useLiveQuery } from 'dexie-react-hooks'
// import { useEffect, useState } from 'react'
// import { getPendingJobsFromCache } from 'app/_controllers/pendingJobsController'
import { JobStatus } from '_types'
import { db } from 'app/_db/dexie'

export default function usePendingItems(filter: string = 'all') {
  let pendingImages =
    useLiveQuery(() => db?.pending?.orderBy('id')?.toArray(), []) || []

  /**
   * DEPRECATED:
   * useLiveQuery seems to work better, but I'm keeping the old interval based method commented here just
   * in case I need to switch things out for performance reasons.
   */
  // const [pendingImages, setPendingImages] = useState<Array<any>>([])

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setPendingImages([...getPendingJobsFromCache()])
  //   }, 1000)

  //   return () => {
  //     clearInterval(interval)
  //   }
  // }, [])

  const done: any = []
  const processing: any = []
  const queued: any = []
  const waiting: any = []
  const error: any = []

  pendingImages.forEach((job: any) => {
    if (job.jobStatus === JobStatus.Done) {
      done.push(job)
    }

    if (job.jobStatus === JobStatus.Processing) {
      processing.push(job)
    }

    if (
      job.jobStatus === JobStatus.Queued ||
      job.jobStatus === JobStatus.Requested
    ) {
      queued.push(job)
    }

    if (job.jobStatus === JobStatus.Waiting) {
      waiting.push(job)
    }

    if (job.jobStatus === JobStatus.Error) {
      error.push(job)
    }
  })

  const sorted = [...done, ...processing, ...queued, ...waiting, ...error].sort(
    (a: any, b: any) => {
      const key = 'timestamp' // or: `id`

      if (a[key] > b[key]) {
        return 1
      }
      if (a[key] < b[key]) {
        return -1
      }
      return 0
    }
  )

  return sorted.filter((job) => {
    if (filter === 'all') {
      return true
    }

    if (filter === 'done') {
      return job.jobStatus === JobStatus.Done
    }

    if (filter === 'processing') {
      return (
        job.jobStatus === JobStatus.Processing ||
        job.jobStatus === JobStatus.Queued
      )
    }

    if (filter === 'error') {
      return job.jobStatus === JobStatus.Error
    }
  })
}
