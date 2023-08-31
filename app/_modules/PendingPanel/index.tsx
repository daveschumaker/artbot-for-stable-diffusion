/* eslint-disable @next/next/no-img-element */
'use client'

import {
  IconFilter,
  IconPhoto,
  IconPhotoOff,
  IconSettings
} from '@tabler/icons-react'
import styles from './pendingPanel.module.css'
import FlexRow from 'app/_components/FlexRow'
import usePendingJobs from './usePendingJobs'
import { JobStatus } from 'types'
import { useCallback, useState } from 'react'
import FilterOptions from 'app/_pages/PendingPage/FilterOptions'
import PendingSettings from 'app/_pages/PendingPage/PendingSettings'
import ClearJobs from 'app/_pages/PendingPage/ClearJobs'
import { Button } from 'app/_components/Button'
import { Virtuoso } from 'react-virtuoso'
import PendingPanelImageCard from './PendingPanelImageCard'

export default function PendingPanel() {
  const [done, processing, queued, waiting, error] = usePendingJobs()
  const [filter, setFilter] = useState('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)

  const jobs = [...done, ...processing, ...queued, ...waiting, ...error]

  const filterJobs = useCallback(() => {
    let filterJobs = [
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

      if (filter === 'waiting') {
        return job.jobStatus === JobStatus.Waiting
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

    return filterJobs
  }, [done, error, filter, processing, queued, waiting])

  const filteredJobs = filterJobs()

  return (
    <div className={styles.PendingPanelWrapper}>
      <FlexRow gap={4} pb={8}>
        <IconPhoto stroke={1.5} /> Image queue
      </FlexRow>
      <FlexRow
        gap={4}
        style={{
          justifyContent: 'space-between',
          position: 'relative',
          width: '100%'
        }}
      >
        {showFilterDropdown && (
          <FilterOptions
            filter={filter}
            setFilter={setFilter}
            jobs={[done, processing, queued, waiting, error]}
            jobCount={jobs.length}
            setShowFilterDropdown={setShowFilterDropdown}
          />
        )}
        {showSettingsDropdown && (
          <PendingSettings setShowSettingsDropdown={setShowSettingsDropdown} />
        )}
        <FlexRow>
          <ClearJobs filter={'all'} pendingImages={jobs} size="small" />
        </FlexRow>
        <FlexRow gap={4} style={{ justifyContent: 'flex-end' }}>
          <Button onClick={() => setShowFilterDropdown(true)} size="small">
            <IconFilter stroke={1.5} />
          </Button>
          <Button onClick={() => setShowSettingsDropdown(true)} size="small">
            <IconSettings stroke={1.5} />
          </Button>
        </FlexRow>
      </FlexRow>
      <div className={styles.PendingImagesContainer} style={{}}>
        {filteredJobs.length === 0 && (
          <div className={styles.NoRequests}>
            <IconPhotoOff size={36} stroke={1} />
            You have no pending image requests. Why not create something?
          </div>
        )}
        {filteredJobs.length > 0 && (
          <Virtuoso
            className={styles['virtual-list']}
            totalCount={filteredJobs.length}
            style={{
              overflowY: 'auto',
              position: 'absolute',
              marginTop: '0',
              top: '0',
              bottom: '0',
              left: '0',
              right: '0'
            }}
            components={{
              Footer: () => {
                return (
                  <div
                    style={{
                      height: '8px',
                      marginBottom: '8px'
                    }}
                  >
                    {' '}
                  </div>
                )
              }
            }}
            itemContent={(index) => (
              <PendingPanelImageCard index={index} jobs={filteredJobs} />
            )}
          />
        )}
      </div>
    </div>
  )
}
