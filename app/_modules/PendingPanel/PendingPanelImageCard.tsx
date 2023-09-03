/* eslint-disable @next/next/no-img-element */
import { JobStatus } from 'types'
import styles from './pendingPanel.module.css'
import {
  deleteCompletedImage,
  deleteImageFromDexie,
  getImageDetails
} from 'utils/db'
import { setImageDetailsModalOpen } from 'store/appStore'
import { useModal } from '@ebay/nice-modal-react'
import placeholderImage from '../../../public/placeholder.gif'

import ImageModal from '../ImageModal'
import clsx from 'clsx'
import {
  deletePendingJob,
  getPendingJob,
  updatePendingJobV2
} from 'controllers/pendingJobsCache'
import { deletePendingJobFromApi } from 'api/deletePendingJobFromApi'
import {
  IconAlertTriangle,
  IconHeart,
  IconPhotoUp,
  IconTrash,
  IconX
} from '@tabler/icons-react'
import SpinnerV2 from 'components/Spinner'
import useSdxlModal from './useSdxlModal'
import { useState } from 'react'
import AbTestModal from 'modules/PendingItem/AbTestModal'
import AwesomeModal from '../AwesomeModal'

export default function PendingPanelImageCard({
  index,
  jobs
}: {
  index: number
  jobs: any[]
}) {
  const imageJob: any = jobs[index]
  const imagePreviewModal = useModal(ImageModal)
  // const abTestModal = useModal(AbTestModal)
  const abTestModal = useModal(AwesomeModal)

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
                label: 'SDXL Beta Test',
                children: (
                  <AbTestModal
                    jobDetails={imageDetails}
                    secondaryId={secondaryId as string}
                    secondaryImage={secondaryImage as string}
                    setIsRated={setIsRated}
                  />
                ),
                subtitle: 'Choose which image you think is best:',
                tooltip: 'SDXL is currently in beta and provided by Stability.ai in order to refine future image models. Please select one of the following two images to choose as the best image for this particular generation. You will be rewarded 15 kudos for each rating.
              })
              return
            } else {
              imagePreviewModal.show({
                handleClose: () => imagePreviewModal.remove(),
                imageDetails
              })
            }
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
