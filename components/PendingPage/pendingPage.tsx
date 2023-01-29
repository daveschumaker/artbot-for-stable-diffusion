import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useEffect, useState } from 'react'
import { useEffectOnce } from '../../hooks/useEffectOnce'
import {
  clearCompletedJob,
  getCompletedJobs,
  resetCompleted,
  setCompletedJob
} from '../../store/pendingItemsCache'
import { JobStatus } from '../../types'
import {
  db,
  deleteAllPendingErrors,
  deleteAllPendingJobs,
  deleteCompletedImage,
  deleteDoneFromPending
} from '../../utils/db'
import PendingItem from '../PendingItemV2'
import ServerMessage from '../ServerMessage'
import Linker from '../UI/Linker'
import PageTitle from '../UI/PageTitle'
import TextButton from '../UI/TextButton'
import ImageModalController from './ImageModalController'

const PendingPage = () => {
  const [filter, setFilter] = useState('all')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pendingImages =
    useLiveQuery(() => db?.pending?.orderBy('id')?.toArray()) || []
  const [done, setDone] = useState<Array<any>>([])
  const [showImageModal, setShowImageModal] = useState(false)

  // On modal open (or close), freeze state of completed jobs so modal doesn't jump around.
  const [jobsForModal, setJobsForModal] = useState<Array<any>>([])

  const processDone = useCallback(() => {
    pendingImages.forEach((job: any) => {
      const DONE = job.jobStatus === JobStatus.Done

      if (
        DONE &&
        done.filter((_job: any) => {
          return _job.id === job.id
        }).length === 0
      ) {
        setCompletedJob(job)
        setDone(getCompletedJobs())

        if (!showImageModal) {
          setJobsForModal(getCompletedJobs())
        }
      }
    })
  }, [done, pendingImages, showImageModal])

  const deleteImage = async (imageId: string) => {
    await deleteCompletedImage(imageId)
    clearCompletedJob(imageId)
    setDone(getCompletedJobs())
  }

  const processPending = () => {
    const processing: any = []
    const queued: any = []
    const waiting: any = []
    const error: any = []

    pendingImages.forEach((job: any) => {
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

    return [processing, queued, waiting, error]
  }

  const [processing = [], queued = [], waiting = [], error = []] =
    processPending()

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
        job.jobStatus === JobStatus.Requested ||
        job.jobStatus === JobStatus.Queued
      )
    }

    if (filter === 'error') {
      return job.jobStatus === JobStatus.Error
    }
  })

  const waitingCount = processing.length + queued.length

  useEffect(() => {
    processDone()
  }, [processDone])

  useEffectOnce(() => {
    deleteDoneFromPending()
    setDone(getCompletedJobs())

    return () => {
      deleteDoneFromPending()
    }
  })

  return (
    <div style={{ overflowAnchor: 'none' }}>
      {showImageModal && (
        <ImageModalController
          onAfterDelete={() => {}}
          handleDeleteImage={deleteImage}
          handleClose={() => {
            setShowImageModal(false)
            setJobsForModal(getCompletedJobs())
          }}
          imageList={jobsForModal}
          initialIndexJobId={showImageModal}
        />
      )}
      <PageTitle>Your pending images</PageTitle>
      <ServerMessage />
      {pendingImages.length > 0 ? (
        <div className="flex flex-row gap-2 mb-4">
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
      {(pendingImages.length > 0 && done.length > 0) ||
      error.length > 2 ||
      waitingCount > 0 ? (
        <div className="flex flex-row gap-2 mb-2">
          {pendingImages.length > 0 && done.length > 0 && (
            <div className="mb-2">
              <TextButton
                onClick={() => {
                  resetCompleted()
                  setDone(getCompletedJobs())
                }}
              >
                clear completed
              </TextButton>
            </div>
          )}
          {waitingCount > 0 && (
            <div className="mb-2">
              <TextButton color="red" onClick={deleteAllPendingJobs}>
                delete pending jobs
              </TextButton>
            </div>
          )}
          {error.length > 2 && (
            <TextButton color="red" onClick={deleteAllPendingErrors}>
              delete all errors? ({error.length})
            </TextButton>
          )}
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
      {sorted.length > 0 && (
        <div className="mt-2 mb-2">
          Why not <Linker href="/rate">rate some images</Linker> (and earn
          kudos) while you wait?
        </div>
      )}

      {pendingImages.length === 0 && done.length > 0 && (
        <>
          <PageTitle as="h2">Recently completed images</PageTitle>
          <div className="mb-2">
            <TextButton
              onClick={() => {
                resetCompleted()
                setDone(getCompletedJobs())
              }}
            >
              Clear all completed
            </TextButton>
          </div>
        </>
      )}

      {sorted.length > 0 &&
        sorted.map((job: { jobId: string; prompt: string }) => {
          return (
            <PendingItem
              //@ts-ignore
              onImageClick={setShowImageModal}
              //@ts-ignore
              jobDetails={job}
              //@ts-ignore
              jobId={job.jobId}
              key={job.jobId}
            />
          )
        })}
    </div>
  )
}

export default PendingPage
