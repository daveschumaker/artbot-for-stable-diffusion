import {
  fetchPendingImageJobs,
  getPendingJobsFromCache
} from 'controllers/pendingJobsController'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { useVirtualizer } from '@tanstack/react-virtual'

import { useEffectOnce } from '../../hooks/useEffectOnce'
import AppSettings from '../../models/AppSettings'
import { setImagesForModalCache } from '../../store/pendingItemsCache'
import { JobStatus } from '../../types'
import {
  deleteAllPendingErrors,
  deleteAllPendingJobs,
  deleteCompletedImageById,
  deleteDoneFromPending,
  deletePendingJobFromDb
} from '../../utils/db'

import AdContainer from '../AdContainer'
import CheckboxIcon from '../icons/CheckboxIcon'
import DotsVerticalIcon from '../icons/DotsVerticalIcon'
import SquareIcon from '../icons/SquareIcon'
import PendingItem from '../PendingItemV2'
import DropDownMenu from '../UI/DropDownMenu/dropDownMenu'
import DropDownMenuItem from '../UI/DropDownMenuItem'
import Linker from '../UI/Linker'
import MenuButton from '../UI/MenuButton'
import PageTitle from '../UI/PageTitle'
import TextButton from '../UI/TextButton'
import ImageModalController from './ImageModalController'
import { useWindowSize } from 'hooks/useWindowSize'

const MenuSeparator = styled.div`
  width: 100%;
  border-bottom: 1px solid ${(props) => props.theme.navLinkActive};
`

const PendingPage = () => {
  const size = useWindowSize()
  const parentRef = React.useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState('all')
  const [pendingImages, setPendingImages] = useState<Array<any>>([])
  const [showImageModal, setShowImageModal] = useState<string | boolean>(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleDeleteImage = async (id: number, jobId: string) => {
    await deleteCompletedImageById(id)
    await deletePendingJobFromDb(jobId)
    fetchPendingImageJobs()
  }

  const onClosePanel = async (jobId: string) => {
    await deletePendingJobFromDb(jobId)
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
    setImagesForModalCache([...done])
    setShowImageModal(jobId)
  }

  const sorted = [...done, ...processing, ...queued, ...waiting, ...error]
    // .sort((a: any, b: any) => {
    //   if (a.id > b.id) {
    //     return 1
    //   }
    //   if (a.id < b.id) {
    //     return -1
    //   }
    //   return 0
    // })
    .filter((job) => {
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
    })

  const jobsInProgress = processing.length + queued.length

  useEffectOnce(() => {
    const interval = setInterval(() => {
      setPendingImages([...getPendingJobsFromCache()])
    }, 1000)

    return () => {
      clearInterval(interval)
      if (AppSettings.get('autoClearPending')) {
        deleteDoneFromPending()
      }
      setShowImageModal(false)
    }
  })

  const renderRow = ({ index }: { index: number }) => {
    const job = sorted[index]

    if (!job || !job.jobId) {
      return null
    }

    return (
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
    )
  }

  const virtualizer = useVirtualizer({
    count: sorted.length + 1,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 240,
    overscan: 1
  })

  const items = virtualizer.getVirtualItems()
  let listHeight = 500

  if (size.width && size.height) {
    if (size.width < 640) {
      listHeight = size.height - 280
    } else {
      listHeight = size.height - 280
    }
  }

  return (
    <div style={{ overflowAnchor: 'none' }}>
      {showImageModal && (
        <ImageModalController
          reverseButtons
          onAfterDelete={() => {}}
          handleDeleteImage={handleDeleteImage}
          handleClose={() => {
            setShowImageModal(false)
          }}
          imageList={done}
          initialIndexJobId={showImageModal}
        />
      )}
      <div className="flex flex-row w-full items-center">
        <div className="inline-block w-3/4">
          <PageTitle>Your pending images</PageTitle>
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
            <DotsVerticalIcon size={24} />
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
                  deleteDoneFromPending()
                }}
              >
                Clear completed
              </DropDownMenuItem>
              <DropDownMenuItem onClick={deleteAllPendingJobs}>
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
      {pendingImages.length > 0 ? (
        <div className="flex flex-row gap-2 mb-4">
          <TextButton onClick={() => setFilter('all')}>
            all ({pendingImages.length})
          </TextButton>
          <TextButton onClick={() => setFilter('done')}>
            done ({done.length})
          </TextButton>
          <TextButton onClick={() => setFilter('processing')}>
            processing ({jobsInProgress})
          </TextButton>
          <TextButton onClick={() => setFilter('error')}>
            error ({error.length})
          </TextButton>
        </div>
      ) : null}
      {(pendingImages.length > 0 && done.length > 0) ||
      error.length > 2 ||
      jobsInProgress > 0 ? (
        <div className="flex flex-row gap-2 mb-2">
          {pendingImages.length > 0 && done.length > 0 && (
            <div className="mb-2">
              <TextButton
                onClick={() => {
                  deleteDoneFromPending()
                }}
              >
                clear completed
              </TextButton>
            </div>
          )}
          {jobsInProgress > 0 && (
            <div className="mb-2">
              <TextButton color="red" onClick={deleteAllPendingJobs}>
                delete pending jobs
              </TextButton>
            </div>
          )}
          {error.length > 2 && (
            <TextButton color="red" onClick={deleteAllPendingErrors}>
              delete all errors? ({error.length})
            </TextButton>
          )}
        </div>
      ) : null}
      {pendingImages.length === 0 && (
        <div className="mt-4 mb-2">
          No images pending.{' '}
          <Linker href="/" className="text-cyan-400">
            Why not create something?
          </Linker>
        </div>
      )}
      {sorted.length > 0 && (
        <div className="mt-2 mb-2">
          Why not <Linker href="/rate">rate some images</Linker> (and earn
          kudos) while you wait?
        </div>
      )}

      {pendingImages.length === 0 && done.length > 0 && (
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

      {AppSettings.get('useWorkerId') && (
        <div className="mt-4 mb-4 text-amber-400 font-semibold rounded border border-amber-400 p-[8px]">
          FYI: You are currently sending jobs to only one worker. Jobs may not
          complete if worker is not available or under heavy load.
        </div>
      )}

      {sorted.length === 0 && (
        <div className="w-full">
          <AdContainer minSize={0} maxSize={640} />
        </div>
      )}

      {sorted.length > 0 && (
        <div
          ref={parentRef}
          className="List"
          style={{
            height: listHeight,
            width: '100%',
            overflowY: 'auto',
            contain: 'strict'
          }}
          id="pending-list-v2"
        >
          <div
            style={{
              height: virtualizer.getTotalSize(),
              width: '100%',
              position: 'relative'
            }}
          >
            <div
              className="mb-[54px]"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${items[0].start}px)`
              }}
            >
              {items.map((virtualRow: any) => (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                >
                  {virtualRow.index === 0 && (
                    <div
                      className="w-full px-[8px] mb-[8px]"
                      style={{ padding: '2px 8px 2px 8px' }}
                    >
                      <AdContainer minSize={0} maxSize={640} />
                    </div>
                  )}
                  <div style={{ padding: '0 8px' }}>
                    {renderRow({ index: virtualRow.index })}
                  </div>
                  {virtualRow.index === items.length && (
                    <div className="h-[40px] w-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PendingPage
