import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useState } from 'react'
import LazyLoad from 'react-lazyload'
import styled from 'styled-components'
import { useEffectOnce } from '../../hooks/useEffectOnce'
import AppSettings from '../../models/AppSettings'
import { setImagesForModalCache } from '../../store/pendingItemsCache'
import { JobStatus } from '../../types'
import {
  db,
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

const MenuSeparator = styled.div`
  width: 100%;
  border-bottom: 1px solid ${(props) => props.theme.navLinkActive};
`

const PendingPage = () => {
  const [filter, setFilter] = useState('all')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pendingImages =
    useLiveQuery(() => db?.pending?.orderBy('id')?.toArray()) || []

  const [showImageModal, setShowImageModal] = useState<string | boolean>(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleDeleteImage = async (id: number, jobId: string) => {
    await deleteCompletedImageById(id)
    await deletePendingJobFromDb(jobId)
  }

  const onClosePanel = async (jobId: string) => {
    await deletePendingJobFromDb(jobId)
  }

  const processPending = useCallback(() => {
    const done: any = []
    const processing: any = []
    const queued: any = []
    const waiting: any = []
    const error: any = []

    pendingImages
      .sort((a: any, b: any) => {
        if (a.id > b.id) {
          return 1
        }
        if (a.id < b.id) {
          return -1
        }
        return 0
      })
      .forEach((job: any) => {
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

  const sorted = [
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

  const waitingCount = processing.length + queued.length

  useEffectOnce(() => {
    return () => {
      if (AppSettings.get('autoClearPending')) {
        deleteDoneFromPending()
      }
      setShowImageModal(false)
    }
  })

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
                View processing ({processing.length + queued.length})
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
            processing ({processing.length + queued.length})
          </TextButton>
          <TextButton onClick={() => setFilter('error')}>
            error ({error.length})
          </TextButton>
        </div>
      ) : null}
      {(pendingImages.length > 0 && done.length > 0) ||
      error.length > 2 ||
      waitingCount > 0 ? (
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
          {waitingCount > 0 && (
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

      <div className="w-full">
        <AdContainer minSize={0} maxSize={640} />
      </div>

      {sorted.length > 0 &&
        sorted.map((job: { jobId: string; prompt: string }) => {
          return (
            <LazyLoad key={job.jobId} height={236} offset={600}>
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
            </LazyLoad>
          )
        })}
    </div>
  )
}

export default PendingPage
