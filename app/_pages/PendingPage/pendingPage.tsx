'use client'

import React, { useCallback, useState } from 'react'

import AppSettings from 'app/_data-models/AppSettings'
import { JobStatus } from '_types'
import { deleteDoneFromPending } from 'app/_utils/db'

import AdContainer from 'app/_components/AdContainer'
import Linker from 'app/_components/Linker'
import PageTitle from 'app/_components/PageTitle'
import styles from './pendingPage.module.css'
import { useStore } from 'statery'
import { appInfoStore } from 'app/_store/appStore'
import FlexRow from 'app/_components/FlexRow'
import { IconFilter, IconInfoTriangle, IconSettings } from '@tabler/icons-react'
import { Button } from 'app/_components/Button'
import FilterOptions from './FilterOptions'
import Accordion from 'app/_components/Accordion'
import AccordionItem from 'app/_components/AccordionItem'
import MaxWidth from 'app/_components/MaxWidth'
import PendingSettings from './PendingSettings'
import ClearJobs from './ClearJobs'
import clsx from 'clsx'
import VirtualListContainer from './VirtualListContainer'
import TextButton from 'app/_components/TextButton'
import usePendingJobs from 'app/_modules/PendingPanel/usePendingJobs'

const PendingPage = () => {
  const [done, processing, queued, waiting, error] = usePendingJobs()

  const [filter, setFilter] = useState('all')
  const appState = useStore(appInfoStore)
  const { imageDetailsModalOpen } = appState

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

  let filteredJobs = filterJobs()

  let titleDescript = `All images (${jobs.length})`

  if (filter === 'processing') {
    titleDescript = `Processing (${queued.length + processing.length})`
  }

  if (filter === 'done') {
    titleDescript = `Finished (${done.length})`
  }

  if (filter === 'waiting') {
    titleDescript = `Waiting (${waiting.length})`
  }

  if (filter === 'error') {
    titleDescript = `Errors (${error.length})`
  }

  return (
    <div style={{ overflowAnchor: 'none' }}>
      <div
        className="flex flex-row items-center w-full"
        style={{
          justifyContent: 'space-between',
          paddingBottom: '8px',
          position: 'relative'
        }}
      >
        <div style={{ width: '100%' }}>
          <PageTitle style={{ marginBottom: 0 }}>
            Image queue: {titleDescript}
          </PageTitle>
        </div>
      </div>
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
            jobs={jobs}
            jobCount={jobs.length}
            setShowFilterDropdown={setShowFilterDropdown}
          />
        )}
        {showSettingsDropdown && (
          <PendingSettings setShowSettingsDropdown={setShowSettingsDropdown} />
        )}
        <FlexRow>
          <ClearJobs filter={filter} pendingImages={jobs} />
        </FlexRow>
        <FlexRow gap={4} style={{ justifyContent: 'flex-end' }}>
          <Button onClick={() => setShowFilterDropdown(true)}>
            <IconFilter stroke={1.5} />
          </Button>
          <Button onClick={() => setShowSettingsDropdown(true)}>
            <IconSettings stroke={1.5} />
          </Button>
        </FlexRow>
      </FlexRow>
      {AppSettings.get('useWorkerId') && (
        <div style={{ paddingTop: '12px' }}>
          <Accordion>
            <AccordionItem
              title={
                <FlexRow gap={4}>
                  <IconInfoTriangle />
                  <strong>Using single worker</strong>
                </FlexRow>
              }
            >
              <div
                className="text-amber-400 font-semibold rounded border border-amber-400"
                style={{
                  border: '1px solid rgb(251 191 36)',
                  fontSize: '14px',
                  fontWeight: 700,
                  margin: '8px 0',
                  padding: '8px'
                }}
              >
                FYI: You are currently sending jobs to only one worker. Jobs may
                not complete if worker is not available or under heavy load, or
                certain request parameters aren&apos;t available (i.e., model,
                image resolution, post-processors).
              </div>
            </AccordionItem>
          </Accordion>
        </div>
      )}
      <MaxWidth
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          position: 'relative'
        }}
      >
        <VirtualListContainer
          completedJobs={done}
          items={filteredJobs}
          jobsInProgress={(queued.length | processing.length) > 0}
        />

        {(jobs.length === 0 || filteredJobs.length === 0) && (
          <div
            className={clsx(
              styles.ListWrapper,
              jobs.length > 0 && styles.ListWrapperHasItems
            )}
          >
            {jobs.length === 0 && (
              <div style={{ padding: '16px 16px 12px 0' }}>
                No images pending.{' '}
                <Linker href="/" style={{ color: 'rgb(34 211 238)' }}>
                  Why not create something?
                </Linker>
              </div>
            )}

            {jobs.length === 0 && done.length > 0 && (
              <>
                <PageTitle as="h2">Recently completed images</PageTitle>
                <div className="mb-2">
                  <TextButton
                    onClick={() => {
                      deleteDoneFromPending()
                    }}
                  >
                    Clear all completed
                  </TextButton>
                </div>
              </>
            )}

            {filteredJobs.length === 0 && !imageDetailsModalOpen && (
              <div className={styles.MobileAd}>
                <AdContainer style={{ margin: '0 auto', maxWidth: '480px' }} />
              </div>
            )}
          </div>
        )}
      </MaxWidth>
    </div>
  )
}

export default PendingPage
