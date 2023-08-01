'use client'

import { fetchPendingImageJobs } from 'controllers/pendingJobsController'
import React, { useCallback, useEffect, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'

import { useEffectOnce } from 'hooks/useEffectOnce'
import AppSettings from 'models/AppSettings'
import { JobStatus } from 'types'
import {
  deleteDoneFromPending,
  deletePendingJobFromDb,
  getImageDetails
} from 'utils/db'

import AdContainer from 'components/AdContainer'
// import CheckboxIcon from 'components/icons/CheckboxIcon'
// import DotsVerticalIcon from 'components/icons/DotsVerticalIcon'
// import SquareIcon from 'components/icons/SquareIcon'
// import DropDownMenu from 'components/UI/DropDownMenu/dropDownMenu'
// import DropDownMenuItem from 'components/UI/DropDownMenuItem'
import Linker from 'components/UI/Linker'
// import MenuButton from 'app/_components/MenuButton'
import PageTitle from 'app/_components/PageTitle'
import TextButton from 'components/UI/TextButton'
import { useWindowSize } from 'hooks/useWindowSize'
import styles from './pendingPage.module.css'
// import FilterClearOptions from './filterClearOptions'
// import { isInstalledPwa } from 'utils/appUtils'
import { useStore } from 'statery'
import { appInfoStore } from 'store/appStore'
import {
  deletePendingJob,
  deletePendingJobs,
  getAllPendingJobs
} from 'controllers/pendingJobsCache'
import usePendingImageModal from './usePendingImageModal'
import PendingItem from 'modules/PendingItem'
import FlexRow from 'app/_components/FlexRow'
import { IconFilter, IconInfoTriangle, IconSettings } from '@tabler/icons-react'
import { Button } from 'components/UI/Button'
import FilterOptions from './FilterOptions'
import Accordion from 'app/_components/Accordion'
import AccordionItem from 'app/_components/AccordionItem'
import MaxWidth from 'components/UI/MaxWidth'
import PendingSettings from './PendingSettings'
import ClearJobs from './ClearJobs'

const PendingPage = () => {
  const size = useWindowSize()
  const [filter, setFilter] = useState('all')
  const [validatePending, setValidatePending] = useState(false)
  const appState = useStore(appInfoStore)
  const { adHidden, imageDetailsModalOpen } = appState

  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)

  const [pendingImages, setPendingImages] = useState([])
  const [showImageModal] = usePendingImageModal()

  const initPageLoad = async () => {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.DEBUG_PENDING_JOBS) {
      console.log(`pendingPage#initPageLoad`)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      // @ts-ignore
      setPendingImages(getAllPendingJobs())
    }, 250)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const onClosePanel = async (jobId: string) => {
    await deletePendingJobFromDb(jobId)
    deletePendingJob(jobId)
    fetchPendingImageJobs()
  }

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

  const handleShowModalClick = (jobId: string) => {
    showImageModal({ jobId, images: done })
    return jobId
  }

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
    initPageLoad()

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

  const renderRow = ({ index }: { index: any }) => {
    const job = sorted[index]

    if (!job || !job.jobId) {
      return null
    }

    return (
      <>
        {inProgress.length > 0 && index === 0 && (
          <div style={{ paddingBottom: '12px' }}>
            Why not <Linker href="/rate">rate some images</Linker> (and earn
            kudos) while you wait?
          </div>
        )}
        {index === 0 &&
          !imageDetailsModalOpen &&
          !adHidden &&
          // @ts-ignore
          size?.width < 800 && <AdContainer className={styles.AdUnit} />}
        <PendingItem
          handleCloseClick={() => {
            onClosePanel(job.jobId)
          }}
          //@ts-ignore
          onImageClick={handleShowModalClick}
          // onHideClick={}
          //@ts-ignore
          jobDetails={job}
          //@ts-ignore
          jobId={job.jobId}
        />
      </>
    )
  }

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
        {/* <div className="flex flex-row justify-end w-1/4 items-start h-[38px] relative gap-2">
          <MenuButton
            active={showMenu}
            title="Pending options"
            onClick={() => {
              if (showMenu) {
                setShowMenu(false)
              } else {
                setShowMenu(true)
              }
            }}
          >
            <div className="flex flex-row items-center">
              <div className={styles['menu-title']}>{filter}</div>
              <DotsVerticalIcon size={24} />
            </div>
          </MenuButton>
          {showMenu && (
            <DropDownMenu
              handleClose={() => {
                setShowMenu(false)
              }}
            >
              <DropDownMenuItem onClick={() => setFilter('all')}>
                View all ({pendingImages.length})
              </DropDownMenuItem>
              <DropDownMenuItem onClick={() => setFilter('processing')}>
                View processing ({jobsInProgress})
              </DropDownMenuItem>
              <DropDownMenuItem onClick={() => setFilter('done')}>
                View done ({done.length})
              </DropDownMenuItem>
              <DropDownMenuItem onClick={() => setFilter('error')}>
                View errors ({error.length})
              </DropDownMenuItem>
              <MenuSeparator />
              <DropDownMenuItem
                onClick={() => {
                  deletePendingJobs(JobStatus.Done)
                  deleteDoneFromPending()
                }}
              >
                Clear completed
              </DropDownMenuItem>
              <DropDownMenuItem
                onClick={() => {
                  deletePendingJobs(JobStatus.Queued)
                  deletePendingJobs(JobStatus.Waiting)
                  deleteAllPendingJobs()
                }}
              >
                Clear pending
              </DropDownMenuItem>
              <DropDownMenuItem onClick={deleteAllPendingErrors}>
                Clear errors
              </DropDownMenuItem>
              <MenuSeparator />
              <DropDownMenuItem
                onClick={() => {
                  if (AppSettings.get('autoClearPending')) {
                    AppSettings.set('autoClearPending', false)
                  } else {
                    AppSettings.set('autoClearPending', true)
                  }
                }}
              >
                <div className="flex flex-row gap-[8px]">
                  {AppSettings.get('autoClearPending') ? (
                    <CheckboxIcon />
                  ) : (
                    <SquareIcon />
                  )}
                  <div>
                    Auto-clear completed?
                    <div className="text-xs">(when leaving pending page)</div>
                  </div>
                </div>
              </DropDownMenuItem>
            </DropDownMenu>
          )}
        </div> */}
      </div>
      <FlexRow
        gap={4}
        style={{
          justifyContent: 'flex-start',
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
        <ClearJobs filter={filter} pendingImages={pendingImages} />
        <Button onClick={() => setShowFilterDropdown(true)}>
          <IconFilter stroke={1.5} />
        </Button>
        <Button onClick={() => setShowSettingsDropdown(true)}>
          <IconSettings stroke={1.5} />
        </Button>
      </FlexRow>
      {/* <FilterClearOptions filter={filter} pendingImages={pendingImages} /> */}
      <MaxWidth>
        <div className={styles.ListWrapper}>
          {pendingImages.length === 0 && (
            <div style={{ padding: '0 16px 12px 16px' }}>
              No images pending.{' '}
              <Linker href="/" className="text-cyan-400">
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
                    FYI: You are currently sending jobs to only one worker. Jobs
                    may not complete if worker is not available or under heavy
                    load, or certain request parameters aren&apos;t available
                    (i.e., model, image resolution, post-processors).
                  </div>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {sorted.length === 0 && !imageDetailsModalOpen && (
            <div className={styles.MobileAd}>
              <AdContainer style={{ margin: '0 auto', maxWidth: '480px' }} />
            </div>
          )}

          {sorted.length > 0 && (
            <Virtuoso
              className={styles['virtual-list']}
              totalCount={sorted.length}
              style={{
                height: 'unset',
                marginTop: '12px',
                position: 'absolute',
                top: 0
              }}
              components={{
                Footer: () => {
                  return (
                    <div
                      style={{
                        height: '30px',
                        marginBottom: '30px'
                      }}
                    >
                      {' '}
                    </div>
                  )
                }
              }}
              itemContent={(index) => <>{renderRow({ index })}</>}
            />
          )}
        </div>
      </MaxWidth>
    </div>
  )
}

export default PendingPage
