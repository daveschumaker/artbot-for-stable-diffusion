import CircleXIcon from 'components/icons/CircleXIcon'
import FilterIcon from 'components/icons/FilterIcon'
import Separator from 'components/UI/Separator'
import AlertDialogBox from 'components/UI/AlertDialogBox'

import { useCallback, useState } from 'react'
import { JobStatus } from 'types'
import {
  deleteAllPendingErrors,
  deleteAllPendingJobs,
  deleteDoneFromPending
} from 'utils/db'

const FilterClearOptions = ({
  filter,
  pendingImages = [],
  setFilter = () => {}
}: {
  pendingImages: Array<any>
  filter: string
  setFilter: any
}) => {
  const [confirmClear, setConfirmClear] = useState('')

  const processPending = useCallback(() => {
    const done: any = []
    const processing: any = []
    const queued: any = []
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

      if (job.jobStatus === JobStatus.Error) {
        error.push(job)
      }
    })

    return [done, processing, queued, error]
  }, [pendingImages])

  const [done = [], processing = [], queued = [], error = []] = processPending()

  const jobsInProgress = processing.length + queued.length

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
              await deleteDoneFromPending()
            } else if (confirmClear === 'processing') {
              await deleteAllPendingJobs()
            } else if (confirmClear === 'error') {
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
      <div className="flex flex-row w-full items-center text-xs tablet:text-sm mb-2">
        <div className="flex flex-row gap-1 items-center mr-2">
          <FilterIcon />
          <strong>View:</strong>
        </div>
        <div
          className="flex flex-row gap-1 items-center cursor-pointer text-[#5eedde]"
          onClick={() => setFilter('all')}
          style={{ textDecoration: filter === 'all' ? 'underline' : 'unset' }}
        >
          all ({pendingImages.length})
        </div>
        <Separator />
        <div
          className="flex flex-row gap-1 items-center cursor-pointer text-[#5eedde]"
          onClick={() => setFilter('done')}
          style={{ textDecoration: filter === 'done' ? 'underline' : 'unset' }}
        >
          completed ({done.length})
        </div>
        <Separator />
        <div
          className="flex flex-row gap-1 items-center cursor-pointer text-[#5eedde]"
          onClick={() => setFilter('processing')}
          style={{
            textDecoration: filter === 'processing' ? 'underline' : 'unset'
          }}
        >
          pending ({jobsInProgress})
        </div>
        <Separator />
        <div
          className="flex flex-row gap-1 items-center cursor-pointer text-[#5eedde]"
          onClick={() => setFilter('error')}
          style={{ textDecoration: filter === 'error' ? 'underline' : 'unset' }}
        >
          errors ({error.length})
        </div>
      </div>
      <div className="flex flex-row w-full items-center text-xs tablet:text-sm mb-2">
        <div className="flex flex-row gap-1 items-center mr-2">
          <CircleXIcon />
          <strong>Clear:</strong>
        </div>
        <div
          className="flex flex-row gap-1 items-center cursor-pointer text-[#5eedde]"
          onClick={() => setConfirmClear('done')}
        >
          completed ({done.length})
        </div>
        <Separator />
        <div
          className="flex flex-row gap-1 items-center cursor-pointer text-[#5eedde]"
          onClick={() => setConfirmClear('pending')}
        >
          pending ({jobsInProgress})
        </div>
        <Separator />
        <div
          className="flex flex-row gap-1 items-center cursor-pointer text-[#5eedde]"
          onClick={() => setConfirmClear('error')}
        >
          errors ({error.length})
        </div>
      </div>
    </>
  )
}

export default FilterClearOptions
