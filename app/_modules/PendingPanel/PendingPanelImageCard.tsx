/* eslint-disable @next/next/no-img-element */
import { JobStatus } from '_types'
import styles from './pendingPanel.module.css'
import {
  deleteCompletedImage,
  deleteImageFromDexie,
  getImageDetails,
  getPendingJobDetails
} from 'app/_utils/db'
import { setImageDetailsModalOpen } from 'app/_store/appStore'
import { useModal } from '@ebay/nice-modal-react'
import placeholderImage from '../../../public/placeholder.gif'

import ImageModal from '../ImageModal'
import clsx from 'clsx'
import {
  deletePendingJob,
  getPendingJob,
  updatePendingJobV2
} from 'app/_controllers/pendingJobsCache'
import { deletePendingJobFromApi } from 'app/_api/deletePendingJobFromApi'
import {
  IconAlertTriangle,
  IconHeart,
  IconPhotoUp,
  IconTrash,
  IconX
} from '@tabler/icons-react'
import SpinnerV2 from 'app/_components/Spinner'
import useSdxlModal from './useSdxlModal'
import { useCallback, useEffect, useState } from 'react'
import AbTestModal from 'app/_pages/PendingPage/PendingItem/AbTestModal'
import PendingImageModal from './PendingImageModal'
import AwesomeModalWrapper from '../AwesomeModal'
import FlexRow from 'app/_components/FlexRow'
import { base64toBlobUrl } from 'app/_utils/imageUtils'

export default function PendingPanelImageCard({ imageJob }: { imageJob: any }) {
  const imagePreviewModal = useModal(ImageModal)
  const pendingImageModal = useModal(AwesomeModalWrapper)
  const abTestModal = useModal(AbTestModal)

  const [imageSrc, setImageSrc] = useState<string | undefined>()
  const [isSdxlAbTest, secondaryId, secondaryImage] = useSdxlModal(imageJob)
  const [isRated, setIsRated] = useState(false)

  const serverHasJob =
    imageJob.jobStatus === JobStatus.Queued ||
    imageJob.jobStatus === JobStatus.Processing ||
    imageJob.jobStatus === JobStatus.Requested

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

  const loadImage = useCallback(async () => {
    const img = await base64toBlobUrl(
      imageJob.thumbnail || imageJob.base64String
    )
    if (img) {
      setImageSrc(img)
    }
  }, [imageJob.base64String, imageJob.thumbnail])

  useEffect(() => {
    loadImage()

    // Clean up Blob URL when the component unmounts
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc)
    }
  }, [imageSrc, loadImage])

  return (
    <div className={styles.PendingJobCard} key={imageJob.jobId}>
      <div
        className={styles.imageContainer}
        onClick={async () => {
          if (imageJob.jobStatus === JobStatus.Done) {
            const imageDetails = await getImageDetails(imageJob.jobId)
            setImageDetailsModalOpen(true)

            if (isSdxlAbTest && !isRated) {
              abTestModal.show({
                jobDetails: imageDetails,
                // @ts-ignore
                secondaryId,
                // @ts-ignore
                secondaryImage,
                setIsRated
              })
              return
            } else {
              imagePreviewModal.show({
                handleClose: () => imagePreviewModal.remove(),
                imageDetails
              })
            }
          } else {
            const imageDetails = await getPendingJobDetails(imageJob.jobId)

            pendingImageModal.show({
              children: <PendingImageModal imageDetails={imageDetails} />,
              label: 'Pending image',
              handleClose: () => pendingImageModal.remove(),
              style: { maxWidth: '768px' }
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
              color="white"
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
          <IconX color="white" stroke={1} />
        </div>
        {imageJob.jobStatus === JobStatus.Done && (
          <div
            className={styles.TrashButton}
            onClick={(e) => handleDeleteImage(imageJob.jobId, e)}
          >
            <IconTrash color="white" stroke={1} />
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
            color="white"
            stroke={1.5}
            size={36}
            style={{ position: 'absolute' }}
          />
        )}
        {imageJob.jobStatus === JobStatus.Error && (
          <IconAlertTriangle
            color="rgb(234 179 8)"
            size={36}
            stroke={1}
            style={{ position: 'absolute' }}
          />
        )}
        {imageJob.jobStatus === JobStatus.Done && (
          <img
            alt="Completed image"
            src={imageSrc}
            height={imageJob.height}
            width={imageJob.width}
            style={{ borderRadius: '4px', cursor: 'pointer' }}
          />
        )}
        {imageJob.jobStatus !== JobStatus.Done && (
          <div className={styles.ImageStatus}>
            {imageJob.jobStatus === JobStatus.Waiting && <>Sending job...</>}
            {imageJob.jobStatus === JobStatus.Requested && (
              <>Job requested...</>
            )}
            {imageJob.jobStatus === JobStatus.Queued && (
              <>Job queued... (~{Number(imageJob.wait_time) || 1}s)</>
            )}
            {imageJob.jobStatus === JobStatus.Processing && (
              <>Processing... (~{Number(imageJob.wait_time) || 1}s)</>
            )}
            {imageJob.jobStatus === JobStatus.Error && <>Error</>}
            {imageJob.jobStatus === JobStatus.Queued &&
              imageJob.is_possible === false && (
                <FlexRow gap={2}>⚠️ No workers for this job</FlexRow>
              )}
          </div>
        )}
      </div>
    </div>
  )
}
