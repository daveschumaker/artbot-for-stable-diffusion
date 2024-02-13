'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { useEffectOnce } from 'app/_hooks/useEffectOnce'
import AppSettings from 'app/_data-models/AppSettings'
import { JobStatus } from '_types'
import {
  deleteDoneFromPending,
  deletePendingJobFromDb,
  getImageDetails
} from 'app/_utils/db'

import Linker from 'app/_components/Linker'
import PageTitle from 'app/_components/PageTitle'
import styles from './pendingPage.module.css'
import {
  deletePendingJob,
  deletePendingJobs,
  getAllPendingJobs
} from 'app/_controllers/pendingJobsCache'
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

const PendingPage = () => {
  const [filter, setFilter] = useState('all')
  const [validatePending, setValidatePending] = useState(false)

  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)

  const [pendingImages, setPendingImages] = useState([])
  const [pendingJobUpdateTimestamp] = useState(0)
  const [initLoad, setInitLoad] = useState(true)

  useEffect(() => {
    if (!initLoad) {
      setInitLoad(false)
    }
  }, [initLoad])

  useEffect(() => {
    const interval = setInterval(() => {
      // @ts-ignore
      setPendingImages(getAllPendingJobs())
      setInitLoad(false)
    }, 250)

    return () => {
      clearInterval(interval)
    }
  }, [pendingJobUpdateTimestamp])

  const processPending = useCallback(() => {
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

    return [done, processing, queued, waiting, error]
  }, [pendingImages])

  const [done = [], processing = [], queued = [], waiting = [], error = []] =
    processPending()

  const inProgress = [].concat(processing, queued, waiting)

  let sorted = [...done, ...processing, ...queued, ...waiting, ...error].filter(
    (job) => {
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
    }
  )

  sorted = sorted.sort((a: any = {}, b: any = {}) => {
    if (a.id < b.id) {
      return -1
    }

    if (a.id > b.id) {
      return 1
    }

    return 0
  })

  const jobsInProgress = processing.length + queued.length

  useEffectOnce(() => {
    return () => {
      if (AppSettings.get('autoClearPending')) {
        deletePendingJobs(JobStatus.Done)
        deleteDoneFromPending()
      }
    }
  })

  /**
   * Handle a potential race condition where images are somehow deleted from completed items table
   * but never removed from pending items table, resulting in all sorts of errors.
   */
  const verifyImagesExist = useCallback(async () => {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.DEBUG_PENDING_JOBS) {
      console.log(`pendingPage#verifyImagesExist`)
    }

    if (done.length === 0) {
      await deleteDoneFromPending()
      return
    }

    for (const idx in done) {
      getImageDetails.delete(done[idx].jobId) // Bust memo cache
      const exists = (await getImageDetails(done[idx].jobId)) || {}

      if (!exists.id) {
        await deletePendingJobFromDb(done[idx].jobId)
        deletePendingJob(done[idx].jobId)
      }
    }

    setValidatePending(true)
  }, [done])

  useEffect(() => {
    if (!validatePending) {
      verifyImagesExist()
    }
  }, [validatePending, verifyImagesExist])

  // let listHeight = 500

  // if (isInstalledPwa() && size.height) {
  //   listHeight = size.height - 276
  // } else if (size.height) {
  //   listHeight = size.height - 240
  // }

  let titleDescript = `All images (${pendingImages.length})`

  if (filter === 'processing') {
    titleDescript = `Processing (${jobsInProgress})`
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
            jobs={processPending()}
            jobCount={pendingImages.length}
            setShowFilterDropdown={setShowFilterDropdown}
          />
        )}
        {showSettingsDropdown && (
          <PendingSettings setShowSettingsDropdown={setShowSettingsDropdown} />
        )}
        <FlexRow>
          <ClearJobs filter={filter} pendingImages={pendingImages} />
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
          items={sorted}
          jobsInProgress={inProgress.length > 0}
        />

        {(pendingImages.length === 0 || sorted.length === 0) && (
          <div
            className={clsx(
              styles.ListWrapper,
              pendingImages.length > 0 && styles.ListWrapperHasItems
            )}
          >
            {pendingImages.length === 0 && (
              <div style={{ padding: '16px 16px 12px 0' }}>
                No images pending.{' '}
                <Linker href="/" style={{ color: 'rgb(34 211 238)' }}>
                  Why not create something?
                </Linker>
              </div>
            )}

            {pendingImages.length === 0 && done.length > 0 && (
              <>
                <PageTitle as="h2">Recently completed images</PageTitle>
                <div className="mb-2">
                  <TextButton
                    onClick={() => {
                      deletePendingJobs(JobStatus.Done)
                      deleteDoneFromPending()
                    }}
                  >
                    Clear all completed
                  </TextButton>
                </div>
              </>
            )}
          </div>
        )}
      </MaxWidth>
    </div>
  )
}

export default PendingPage
