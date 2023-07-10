import { fetchPendingImageJobs } from 'controllers/pendingJobsController'
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Virtuoso } from 'react-virtuoso'

import { useEffectOnce } from '../../hooks/useEffectOnce'
import AppSettings from '../../models/AppSettings'
import { JobStatus } from '../../types'
import {
  allPendingJobs,
  clearPendingJobsTable,
  deleteAllPendingErrors,
  deleteAllPendingJobs,
  deleteDoneFromPending,
  deletePendingJobFromDb,
  getImageDetails
} from '../../utils/db'

import AdContainer from '../AdContainer'
import CheckboxIcon from '../icons/CheckboxIcon'
import DotsVerticalIcon from '../icons/DotsVerticalIcon'
import SquareIcon from '../icons/SquareIcon'
import DropDownMenu from '../UI/DropDownMenu/dropDownMenu'
import DropDownMenuItem from '../UI/DropDownMenuItem'
import Linker from '../UI/Linker'
import MenuButton from '../UI/MenuButton'
import PageTitle from '../UI/PageTitle'
import TextButton from '../UI/TextButton'
import { useWindowSize } from 'hooks/useWindowSize'
import styles from './pendingPage.module.css'
import FilterClearOptions from './filterClearOptions'
import { isInstalledPwa } from 'utils/appUtils'
import { useStore } from 'statery'
import { appInfoStore } from 'store/appStore'
import {
  deletePendingJob,
  deletePendingJobs,
  getAllPendingJobs
  // syncPendingJobsFromDb
} from 'controllers/pendingJobsCache'
import usePendingImageModal from './usePendingImageModal'
import PendingItem from 'modules/PendingItem'

const MenuSeparator = styled.div`
  width: 100%;
  border-bottom: 1px solid ${(props) => props.theme.navLinkActive};
`

const PendingPage = () => {
  const size = useWindowSize()
  const [filter, setFilter] = useState('all')
  // const [showImageModal, setShowImageModal] = useState<string | boolean>(false)
  const [showMenu, setShowMenu] = useState(false)
  const [validatePending, setValidatePending] = useState(false)
  const appState = useStore(appInfoStore)
  const { imageDetailsModalOpen } = appState

  const [pendingImages, setPendingImages] = useState([])

  const [showImageModal] = usePendingImageModal()

  const initPageLoad = async () => {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.DEBUG_PENDING_JOBS) {
      console.log(`pendingPage#initPageLoad`)
    }

    // Temporarily hide this as I think this is what is causing the ghost jobs race condition
    // await syncPendingJobsFromDb()

    // // @ts-ignore
    // setPendingImages(getAllPendingJobs())
  }

  const cleanPendingJobsOnUnload = async () => {
    await clearPendingJobsTable()
    deletePendingJobs()

    // @ts-ignore
    if (typeof window !== 'undefined' && window.DEBUG_PENDING_JOBS) {
      const jobs = await allPendingJobs()
      console.log(`cleanPendingJobsOnUnload (jobs in db)`, jobs)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      // @ts-ignore
      setPendingImages(getAllPendingJobs())
    }, 250)

    return () => {
      clearInterval(interval)
      const pendingJobs = getAllPendingJobs()

      if (pendingJobs.length === 0) {
        cleanPendingJobsOnUnload()
      }
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
    showImageModal(jobId)
  }

  let sorted = [...done, ...processing, ...queued, ...waiting, ...error].filter(
    (job) => {
      if (filter === 'all') {
        return true
      }

      if (filter === 'done') {
        return job.jobStatus === JobStatus.Done
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
        {index === 0 && (
          <div className="mt-2 mb-2">
            Why not <Linker href="/rate">rate some images</Linker> (and earn
            kudos) while you wait?
          </div>
        )}
        {index === 0 &&
          !imageDetailsModalOpen &&
          //@ts-ignore
          size.width < 890 && (
            <div className="w-full">
              <AdContainer />
            </div>
          )}
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

  let listHeight = 500

  if (isInstalledPwa() && size.height) {
    listHeight = size.height - 276
  } else if (size.height) {
    listHeight = size.height - 240
  }

  return (
    <div style={{ overflowAnchor: 'none' }}>
      <div className="flex flex-row items-center w-full">
        <div className="inline-block w-3/4">
          <PageTitle>Image queue</PageTitle>
        </div>
        <div className="flex flex-row justify-end w-1/4 items-start h-[38px] relative gap-2">
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
        </div>
      </div>
      <FilterClearOptions
        filter={filter}
        setFilter={setFilter}
        pendingImages={pendingImages}
      />
      {pendingImages.length === 0 && (
        <div className="mt-4 mb-2">
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
        <div className="mt-4 mb-4 text-amber-400 font-semibold rounded border border-amber-400 p-[8px]">
          FYI: You are currently sending jobs to only one worker. Jobs may not
          complete if worker is not available or under heavy load, or certain
          request parameters aren&apos;t available (i.e., model, image
          resolution, post-processors).
        </div>
      )}

      {sorted.length === 0 &&
        !imageDetailsModalOpen &&
        // @ts-ignore
        size.width < 890 && (
          <div className="w-full">
            <AdContainer />
          </div>
        )}

      {sorted.length > 0 && (
        <Virtuoso
          className={styles['virtual-list']}
          style={{
            height: `${listHeight}px`,
            padding: '60px 0'
          }}
          totalCount={sorted.length}
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
  )
}

export default PendingPage
