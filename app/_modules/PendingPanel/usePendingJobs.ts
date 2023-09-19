import {
  getAllPendingJobs,
  getPendingJobsTimestamp
} from 'app/_controllers/pendingJobsCache'
import { useEffect, useState } from 'react'
import { JobStatus } from '_types'

export default function usePendingJobs() {
  const [pendingJobUpdateTimestamp, setPendingJobUpdateTimestamp] = useState(0)

  // Job Buckets
  const [done, setDone] = useState<any[]>([])
  const [processing, setProcessing] = useState<any[]>([])
  const [queued, setQueued] = useState<any[]>([])
  const [waiting, setWaiting] = useState<any[]>([])
  const [error, setError] = useState<any[]>([])

  const processPending = (pendingImages: any[] = []) => {
    const pending_done: any = []
    const pending_processing: any = []
    const pending_queued: any = []
    const pending_waiting: any = []
    const pending_error: any = []

    pendingImages.forEach((job: any) => {
      if (job.jobStatus === JobStatus.Done) {
        pending_done.push(job)
      }

      if (job.jobStatus === JobStatus.Processing) {
        pending_processing.push(job)
      }

      if (
        job.jobStatus === JobStatus.Queued ||
        job.jobStatus === JobStatus.Requested
      ) {
        pending_queued.push(job)
      }

      if (job.jobStatus === JobStatus.Waiting) {
        pending_waiting.push(job)
      }

      if (job.jobStatus === JobStatus.Error) {
        pending_error.push(job)
      }
    })

    const sortByTimestamp = (array: any[]) => {
      array.sort((a: any = {}, b: any = {}) => {
        if (a.timestamp < b.timestamp) {
          return -1
        }

        if (a.timestamp > b.timestamp) {
          return 1
        }

        return 0
      })

      return array
    }

    const sortById = (array: any[]) => {
      array.sort((a: any = {}, b: any = {}) => {
        if (a.id < b.id) {
          return -1
        }

        if (a.id > b.id) {
          return 1
        }

        return 0
      })

      return array
    }

    setDone(sortByTimestamp(pending_done))
    setProcessing(sortById(pending_processing))
    setQueued(sortById(pending_queued))
    setWaiting(sortById(pending_waiting))
    setError(sortById(pending_error))
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingJobUpdateTimestamp !== getPendingJobsTimestamp()) {
        setPendingJobUpdateTimestamp(getPendingJobsTimestamp())
        processPending(getAllPendingJobs())
      }
    }, 250)

    return () => {
      clearInterval(interval)
    }
  }, [pendingJobUpdateTimestamp])

  return [done, processing, queued, waiting, error]
}
