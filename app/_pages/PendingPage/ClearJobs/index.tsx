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
import DropdownOptions from 'app/_modules/DropdownOptions'

export default function ClearJobs({ filter }: any) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showConfirm, setShowConfirm] = useState('')

  // const handleClear = () => {
  //   setShowConfirm(true)
  // }

  return (
    <>
      {showConfirm && (
        <AlertDialogBox
          title="Clear images?"
          message={`
            This will clear all images with a status of ${filter} from the pending items page.
          `}
          onConfirmClick={async () => {
            if (showConfirm === 'done') {
              deletePendingJobs(JobStatus.Done)
              await deleteDoneFromPending()
            } else if (showConfirm === 'pending') {
              await deleteAllPendingJobs()
              deletePendingJobs(JobStatus.Waiting)
              deletePendingJobs(JobStatus.Queued)
            } else if (showConfirm === 'error') {
              deletePendingJobs(JobStatus.Error)
              await deleteAllPendingErrors()
            }

            setShowDropdown(false)
            setShowConfirm('')
          }}
          closeModal={() => {
            setShowConfirm('')
            setShowDropdown(false)
          }}
          showWarningIcon={false}
        />
      )}
      {showDropdown && (
        <DropdownOptions
          handleClose={() => setShowDropdown(false)}
          title="Clear Jobs"
          top="46px"
          maxWidth="280px"
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              rowGap: '16px',
              padding: '16px 0 4px 0'
            }}
          >
            <div
              style={{ cursor: 'pointer' }}
              onClick={() => setShowConfirm('done')}
            >
              Done
            </div>
            <div
              style={{ cursor: 'pointer' }}
              onClick={() => setShowConfirm('pending')}
            >
              Pending
            </div>
            <div
              style={{ cursor: 'pointer' }}
              onClick={() => setShowConfirm('error')}
            >
              Error
            </div>
          </div>
        </DropdownOptions>
      )}
      <Button
        disabled={filter === 'processing'}
        onClick={() => setShowDropdown(true)}
      >
        <IconClearAll stroke={1.5} /> Clear jobs
      </Button>
    </>
  )
}
