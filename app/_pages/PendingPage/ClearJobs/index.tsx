import { IconClearAll } from '@tabler/icons-react'
import { Button } from 'app/_components/Button'
import { useState } from 'react'
import { JobStatus } from '_types/artbot'
import {
  deleteAllPendingErrors,
  deleteAllPendingJobs,
  deleteDoneFromPending
} from 'app/_utils/db'
import { deletePendingJobs } from 'app/_controllers/pendingJobsCache'
import DropdownOptions from 'app/_modules/DropdownOptions'

export default function ClearJobs({ filter, size }: any) {
  const [showDropdown, setShowDropdown] = useState(false)

  const handleClear = async (filter: string) => {
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

    setShowDropdown(false)
  }

  return (
    <>
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
              onClick={() => handleClear('done')}
            >
              Done
            </div>
            <div
              style={{ cursor: 'pointer' }}
              onClick={() => handleClear('pending')}
            >
              Pending
            </div>
            <div
              style={{ cursor: 'pointer' }}
              onClick={() => handleClear('error')}
            >
              Error
            </div>
          </div>
        </DropdownOptions>
      )}
      <Button
        disabled={filter === 'processing'}
        onClick={() => setShowDropdown(true)}
        size={size}
      >
        <IconClearAll stroke={1.5} /> Clear jobs
      </Button>
    </>
  )
}
