import { IconClearAll } from '@tabler/icons-react'
import { Button } from 'components/UI/Button'
import { useState } from 'react'
import AlertDialogBox from 'components/UI/AlertDialogBox'
import { JobStatus } from 'types/artbot'
import {
  deleteAllPendingErrors,
  deleteAllPendingJobs,
  deleteDoneFromPending
} from 'utils/db'
import { deletePendingJobs } from 'controllers/pendingJobsCache'

export default function ClearJobs({ filter }: any) {
  const [showConfirm, setShowConfirm] = useState(false)
  const handleClear = () => {
    setShowConfirm(true)
  }

  return (
    <>
      {showConfirm && (
        <AlertDialogBox
          title="Clear images?"
          message={`
            This will clear all images with a status of ${filter} from the pending items page.
          `}
          onConfirmClick={async () => {
            if (filter === 'done') {
              deletePendingJobs(JobStatus.Done)
              await deleteDoneFromPending()
            } else if (filter === 'pending') {
              await deleteAllPendingJobs()
              deletePendingJobs(JobStatus.Waiting)
              deletePendingJobs(JobStatus.Queued)
            } else if (filter === 'error') {
              deletePendingJobs(JobStatus.Error)
              await deleteAllPendingErrors()
            }

            setShowConfirm(false)
          }}
          closeModal={() => {
            setShowConfirm(false)
          }}
          showWarningIcon={false}
        />
      )}
      <Button disabled={filter === 'processing'} onClick={handleClear}>
        <IconClearAll stroke={1.5} /> Clear jobs
      </Button>
    </>
  )
}
