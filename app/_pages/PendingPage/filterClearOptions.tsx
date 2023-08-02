import CircleXIcon from 'components/icons/CircleXIcon'
import Separator from 'components/UI/Separator'
import AlertDialogBox from 'components/UI/AlertDialogBox'

import { useEffect, useState } from 'react'
import { JobStatus } from 'types'
import {
  deleteAllPendingErrors,
  deleteAllPendingJobs,
  deleteDoneFromPending
} from 'utils/db'
import { deletePendingJobs } from 'controllers/pendingJobsCache'

const FilterClearOptions = ({
  pendingImages = []
}: {
  pendingImages: Array<any>
  filter: string
  setFilter: any
}) => {
  const [confirmClear, setConfirmClear] = useState('')
  const [imageStatus, setImageStatus] = useState({
    done: [],
    processing: [],
    queued: [],
    waiting: [],
    error: []
  })

  useEffect(() => {
    const done: any = []
    const processing: any = []
    const queued: any = []
    const waiting: any = []
    const error: any = []

    for (const item of pendingImages) {
      if (item.jobStatus === JobStatus.Done) {
        done.push(item)
      }

      if (item.jobStatus === JobStatus.Processing) {
        processing.push(item)
      }

      if (
        item.jobStatus === JobStatus.Queued ||
        item.jobStatus === JobStatus.Requested
      ) {
        queued.push(item)
      }

      if (item.jobStatus === JobStatus.Waiting) {
        waiting.push(item)
      }

      if (item.jobStatus === JobStatus.Error) {
        error.push(item)
      }
    }

    setImageStatus({
      done,
      processing,
      queued,
      waiting,
      error
    })
  }, [pendingImages])

  const { done, queued, waiting, error } = imageStatus

  const jobsWaiting = queued.length + waiting.length

  return (
    <>
      {confirmClear && (
        <AlertDialogBox
          title="Clear images?"
          message={`
            This will clear all images with a status of ${confirmClear} from the pending items page.
          `}
          onConfirmClick={async () => {
            if (confirmClear === 'done') {
              deletePendingJobs(JobStatus.Done)
              await deleteDoneFromPending()
            } else if (confirmClear === 'pending') {
              await deleteAllPendingJobs()
              deletePendingJobs(JobStatus.Waiting)
              deletePendingJobs(JobStatus.Queued)
            } else if (confirmClear === 'error') {
              deletePendingJobs(JobStatus.Error)
              await deleteAllPendingErrors()
            }

            setConfirmClear('')
          }}
          closeModal={() => {
            setConfirmClear('')
          }}
          showWarningIcon={false}
        />
      )}
      <div className="flex flex-row w-full items-center text-xs font-[500] tablet:text-sm mb-2">
        <div className="flex flex-row gap-[2px] items-center mr-2">
          <CircleXIcon />
          <strong>Clear:</strong>
        </div>
        <div
          className="flex flex-row gap-[2px] items-center cursor-pointer text-[#14b8a5]"
          onClick={() => setConfirmClear('done')}
        >
          completed ({done.length})
        </div>
        <Separator />
        <div
          className="flex flex-row gap-[2px] items-center cursor-pointer text-[#14b8a5]"
          onClick={() => setConfirmClear('pending')}
        >
          pending ({jobsWaiting})
        </div>
        <Separator />
        <div
          className="flex flex-row gap-[2px] items-center cursor-pointer text-[#14b8a5]"
          onClick={() => setConfirmClear('error')}
        >
          errors ({error.length})
        </div>
      </div>
    </>
  )
}

export default FilterClearOptions
