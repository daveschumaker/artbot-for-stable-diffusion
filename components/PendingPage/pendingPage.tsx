import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useEffectOnce } from '../../hooks/useEffectOnce'
import { JobStatus } from '../../types'
import {
  db,
  deleteAllPendingErrors,
  deleteDoneFromPending
} from '../../utils/db'
import PendingItem from '../PendingItemV2'
import Linker from '../UI/Linker'
import PageTitle from '../UI/PageTitle'
import TextButton from '../UI/TextButton'

const PendingPage = () => {
  const [filter, setFilter] = useState('all')
  const pendingImages =
    useLiveQuery(() => db?.pending?.orderBy('id')?.toArray()) || []

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

    if (job.jobStatus === JobStatus.Queued) {
      queued.push(job)
    }

    if (job.jobStatus === JobStatus.Waiting) {
      waiting.push(job)
    }

    if (job.jobStatus === JobStatus.Error) {
      error.push(job)
    }
  })

  const sorted = [
    ...done,
    ...processing,
    ...queued,
    ...waiting,
    ...error
  ].filter((job) => {
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

  useEffectOnce(() => {
    deleteDoneFromPending()

    return () => {
      deleteDoneFromPending()
    }
  })

  return (
    <div>
      <PageTitle>Your pending images</PageTitle>
      {pendingImages.length > 0 ? (
        <div className="flex flex-row gap-2 mb-2">
          <TextButton onClick={() => setFilter('all')}>
            all ({pendingImages.length})
          </TextButton>
          <TextButton onClick={() => setFilter('done')}>
            done ({done.length})
          </TextButton>
          <TextButton onClick={() => setFilter('processing')}>
            processing ({processing.length + queued.length})
          </TextButton>
          <TextButton onClick={() => setFilter('error')}>
            error ({error.length})
          </TextButton>
        </div>
      ) : null}
      {error.length > 2 ? (
        <div className="mb-2">
          <TextButton color="red" onClick={deleteAllPendingErrors}>
            delete all errors? ({error.length})
          </TextButton>
        </div>
      ) : null}
      {pendingImages.length === 0 && (
        <div className="mt-4 mb-2">
          No images pending.{' '}
          <Linker href="/" className="text-cyan-400">
            Why not create something?
          </Linker>
        </div>
      )}
      {sorted.length > 0 &&
        sorted.map((job: { jobId: string; prompt: string }, i) => {
          return <PendingItem jobId={job.jobId} key={job.jobId + `_${i}`} />
        })}
    </div>
  )
}

export default PendingPage
