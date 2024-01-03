import { useCallback, useEffect, useState } from 'react'
import { JobStatus } from '_types'
import { allPendingJobs, countAllPendingJobs } from 'app/_utils/db'
import { liveQuery } from 'dexie'

export default function usePendingJobs({
  filter,
  start = null,
  end = null
}: {
  filter: string
  start?: number | null
  end?: number | null
}) {
  // Job Buckets
  const [done, setDone] = useState<any[]>([])
  const [processing, setProcessing] = useState<any[]>([])
  const [queued, setQueued] = useState<any[]>([])
  const [waiting, setWaiting] = useState<any[]>([])
  const [error, setError] = useState<any[]>([])

  const [doneCount, setDoneCount] = useState(0)
  const [processingCount, setProcessingCount] = useState(0)
  const [queudCount, setQueudCount] = useState(0)
  const [waitingCount, setWaitingCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)

  const updateCounts = useCallback(() => {
    const countSubscriptions = [
      liveQuery(() => countAllPendingJobs(JobStatus.Done)).subscribe(
        setDoneCount
      ),
      liveQuery(() => countAllPendingJobs(JobStatus.Processing)).subscribe(
        setProcessingCount
      ),
      liveQuery(() => countAllPendingJobs(JobStatus.Queued)).subscribe(
        setQueudCount
      ),
      liveQuery(() => countAllPendingJobs(JobStatus.Waiting)).subscribe(
        setWaitingCount
      ),
      liveQuery(() => countAllPendingJobs(JobStatus.Error)).subscribe(
        setErrorCount
      )
    ]

    return () => {
      countSubscriptions.forEach((sub) => sub.unsubscribe())
    }
  }, [])

  useEffect(() => {
    const unsubscribe = updateCounts()

    return () => {
      unsubscribe()
    }
  }, [updateCounts])

  const filterJobs = (pendingJobs: any) => {
    // console.log(`\n\n-----`)
    // console.log(`start`, start)
    // console.log(`end`, end)
    // console.log(`pendingJobs?`, pendingJobs)

    const pending_done: any = []
    const pending_processing: any = []
    const pending_queued: any = []
    const pending_waiting: any = []
    const pending_error: any = []

    pendingJobs.forEach((job: any) => {
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

  const processPending = useCallback(async () => {
    return liveQuery(() => allPendingJobs(filter as JobStatus, start, end))
  }, [end, filter, start])

  useEffect(() => {
    let subscription: any

    const subscribeToPendingJobs = async () => {
      const observable = await processPending() // Wait for the Promise to resolve
      subscription = observable.subscribe({
        next: (pendingJobs) => {
          console.log(`pendingJobs?`, pendingJobs)

          filterJobs(pendingJobs)
        }
      })
    }

    subscribeToPendingJobs()

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [processPending])

  useEffect(() => {
    const interval = setInterval(() => {
      updateCounts()
    }, 250)

    return () => {
      clearInterval(interval)
    }
  }, [updateCounts])

  return [
    done,
    processing,
    queued,
    waiting,
    error,
    doneCount,
    processingCount,
    queudCount,
    waitingCount,
    errorCount
  ]
}
