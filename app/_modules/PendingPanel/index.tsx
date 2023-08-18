/* eslint-disable @next/next/no-img-element */
'use client'

import {
  IconAlertTriangle,
  IconFilter,
  IconHeart,
  IconPhoto,
  IconPhotoOff,
  IconPhotoUp,
  IconSettings,
  IconTrash,
  IconX
} from '@tabler/icons-react'
import styles from './pendingPanel.module.css'
import FlexRow from 'app/_components/FlexRow'
import usePendingJobs from './usePendingJobs'
import placeholderImage from '../../../public/placeholder.gif'
import { JobStatus } from 'types'
import SpinnerV2 from 'components/Spinner'
import {
  deleteCompletedImage,
  deleteImageFromDexie,
  getImageDetails
} from 'utils/db'
import { setImageDetailsModalOpen } from 'store/appStore'
import { useModal } from '@ebay/nice-modal-react'
import ImageModal from '../ImageModal'
import { useCallback, useState } from 'react'
import FilterOptions from 'app/_pages/PendingPage/FilterOptions'
import PendingSettings from 'app/_pages/PendingPage/PendingSettings'
import ClearJobs from 'app/_pages/PendingPage/ClearJobs'
import { Button } from 'components/UI/Button'
import {
  deletePendingJob,
  getPendingJob,
  updatePendingJobV2
} from 'controllers/pendingJobsCache'
import { deletePendingJobFromApi } from 'api/deletePendingJobFromApi'
import clsx from 'clsx'
import { Virtuoso } from 'react-virtuoso'

export default function PendingPanel() {
  const imagePreviewModal = useModal(ImageModal)
  const [done, processing, queued, waiting, error] = usePendingJobs()
  const [filter, setFilter] = useState('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)

  const jobs = [...done, ...processing, ...queued, ...waiting, ...error]

  const handleDeleteImage = async (jobId: string, e: any) => {
    e.stopPropagation()

    await deleteImageFromDexie(jobId)
    await deleteCompletedImage(jobId)
    deletePendingJob(jobId)
  }

  const handleFavClick = (jobId: string, e: any) => {
    e.stopPropagation()
    const job = getPendingJob(jobId)

    // @ts-ignore
    job.favorited = job.favorited ? false : true
    updatePendingJobV2(job)
  }

  const hideFromPending = (jobId: string, jobStatus: JobStatus, e: any) => {
    e.stopPropagation()

    const serverHasJob =
      jobStatus === JobStatus.Queued || jobStatus === JobStatus.Processing

    if (serverHasJob) {
      deletePendingJobFromApi(jobId)
    }

    deletePendingJob(jobId)
  }

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

  const renderRow = ({ index }: { index: number }) => {
    const imageJob: any = filteredJobs[index]

    const serverHasJob =
      imageJob.jobStatus === JobStatus.Queued ||
      imageJob.jobStatus === JobStatus.Processing ||
      imageJob.jobStatus === JobStatus.Requested
    return (
      <div className={styles.PendingJobCard} key={imageJob.jobId}>
        <div
          className={styles.imageContainer}
          onClick={async () => {
            if (imageJob.jobStatus === JobStatus.Done) {
              const imageDetails = await getImageDetails(imageJob.jobId)
              setImageDetailsModalOpen(true)
              imagePreviewModal.show({
                handleClose: () => imagePreviewModal.remove(),
                imageDetails
              })
            }
          }}
        >
          {imageJob.jobStatus === JobStatus.Done && (
            <div
              className={clsx(
                styles.FavButton,
                imageJob.favorited && styles.favorited
              )}
              onClick={(e) => handleFavClick(imageJob.jobId, e)}
            >
              <IconHeart
                fill={imageJob.favorited ? 'red' : 'rgb(0,0,0,0)'}
                size={26}
                stroke={1}
              />
            </div>
          )}
          <div
            className={styles.CloseButton}
            onClick={(e) =>
              hideFromPending(imageJob.jobId, imageJob.jobStatus, e)
            }
          >
            <IconX />
          </div>
          {imageJob.jobStatus === JobStatus.Done && (
            <div
              className={styles.TrashButton}
              onClick={(e) => handleDeleteImage(imageJob.jobId, e)}
            >
              <IconTrash stroke={1.5} />
            </div>
          )}
          {imageJob.jobStatus !== JobStatus.Done && (
            <img
              alt="Pending image"
              src={placeholderImage.src}
              height={imageJob.height}
              width={imageJob.width}
              style={{ borderRadius: '4px' }}
            />
          )}
          {serverHasJob && <SpinnerV2 style={{ position: 'absolute' }} />}
          {imageJob.jobStatus === JobStatus.Waiting && (
            <IconPhotoUp
              stroke={1.5}
              size={36}
              style={{ position: 'absolute' }}
            />
          )}
          {imageJob.jobStatus === JobStatus.Error && (
            <IconAlertTriangle
              color="rgb(234 179 8)"
              size={36}
              stroke={1.5}
              style={{ position: 'absolute' }}
            />
          )}
          {imageJob.jobStatus === JobStatus.Done && (
            <img
              alt="Completed image"
              src={`data:image/webp;base64,${
                imageJob.thumbnail || imageJob.base64String
              }`}
              height={imageJob.height}
              width={imageJob.width}
              style={{ borderRadius: '4px', cursor: 'pointer' }}
            />
          )}
        </div>
      </div>
    )
  }

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
            itemContent={(index) => <>{renderRow({ index })}</>}
          />
        )}
      </div>
    </div>
  )
}
