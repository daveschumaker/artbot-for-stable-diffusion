/* eslint-disable @next/next/no-img-element */
import { JobStatus } from '_types'
import {
  deleteCompletedImage,
  deleteImageFromDexie,
  getImageDetails,
  getPendingJobDetails
  // updateCompletedJobByJobId
} from 'app/_utils/db'
import {
  setImageDetailsModalOpen,
  updateAdEventTimestamp
} from 'app/_store/appStore'
import { useModal } from '@ebay/nice-modal-react'
import placeholderImage from '../../../../public/placeholder.gif'

import ImageModal from '../../ImageModal'
import clsx from 'clsx'
import {
  deletePendingJob,
  getPendingJob,
  updatePendingJobV2
} from 'app/_controllers/pendingJobsCache'
import { deletePendingJobFromApi } from 'app/_api/deletePendingJobFromApi'
import {
  IconAlertTriangle,
  IconCheck,
  IconHeart,
  IconPhotoUp,
  IconTrash,
  IconX
} from '@tabler/icons-react'
import SpinnerV2 from 'app/_components/Spinner'
import React, { useCallback, useEffect, useState } from 'react'
import PendingImageModal from '../PendingImageModal'
import AwesomeModalWrapper from '../../AwesomeModal'
import FlexRow from 'app/_components/FlexRow'
import { getAllImagesByJobId, getImageByJobId } from 'app/_db/image_files'
import CreateImageRequestV2 from 'app/_data-models/v2/CreateImageRequestV2'
import styles from './component.module.css'
import ImageModel, { ImageStatus } from 'app/_data-models/v2/ImageModel'
import Modal from 'app/_componentsV2/Modal'
import ImageModalV2 from '../ImageModalV2'
import { deleteJobIdFromCompleted } from 'app/_db/transactions'
import PendingModal from '../PendingModal'

/**
 * TODO:
 * - Only show icons / info stuff on mouse hover.
 * - Show confirmation modal for deleting images.
 * - Say you will delete X number of images.
 * - Show status if there is an error or all images are censored.
 * - Click to open modal with all images generated in job (or a carousel?)
 */

const PendingPanelImageCardV2 = React.memo(
  ({ imageJob }: { imageJob: CreateImageRequestV2 }) => {
    const imageModal = useModal(Modal)

    // const [favorited, setFavorited] = useState<boolean>(imageJob.favorited)

    // const imagePreviewModal = useModal(ImageModal)
    const pendingImageModal = useModal(AwesomeModalWrapper)

    const [censoredJob, setCensoredJob] = useState(false)
    const [isVisible, setIsVisible] = useState(
      imageJob.jobStatus === JobStatus.Done
    )
    const [imageSrcs, setImageSrcs] = useState<string[]>([])

    // imageJob.jobStatus = JobStatus.Processing
    const serverHasJob =
      imageJob.jobStatus === JobStatus.Queued ||
      imageJob.jobStatus === JobStatus.Processing ||
      imageJob.jobStatus === JobStatus.Requested

    const handleDeleteImage = async (jobId: string, e: any) => {
      e.stopPropagation()

      // await deleteImageFromDexie(jobId)
      // await deleteCompletedImage(jobId)
      await deleteJobIdFromCompleted(jobId)
      deletePendingJob(jobId)
    }

    // const handleFavClick = (jobId: string, e: any) => {
    //   const updateFavorite = !favorited
    //   e.stopPropagation()
    //   const job = getPendingJob(jobId)

    //   // @ts-ignore
    //   job.favorited = updateFavorite
    //   setFavorited(updateFavorite)
    //   updatePendingJobV2(job)
    //   updateCompletedJobByJobId(job.jobId, {
    //     favorited: updateFavorite
    //   })
    // }

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
      const srcs: string[] = []
      const data = await getAllImagesByJobId(imageJob.jobId)

      // Hackey check to determine if all images are censored.
      // The moment we find that something isn't, set to false.
      let allCensored = true

      data.forEach((image: ImageModel) => {
        if (image.status !== ImageStatus.CENSORED) {
          allCensored = false
        }

        if (image.blob) {
          srcs.push(URL.createObjectURL(image.blob))
        }
      })

      if (allCensored) {
        setCensoredJob(true)
      }

      setImageSrcs(srcs)
    }, [imageJob.jobId, imageJob.version])

    useEffect(() => {
      if (!imageSrcs[0] && imageJob.jobStatus === JobStatus.Done) {
        loadImage()
      }

      return () => {
        if (imageSrcs[0]) URL.revokeObjectURL(imageSrcs[0])
      }
    }, [imageSrcs, loadImage, imageJob.jobStatus])

    let aspectRatio = (imageJob.height / imageJob.width) * 100 // This equals 66.67%

    return (
      <div className={clsx(styles.PendingJobCard)} key={imageJob.jobId}>
        <div
          className={styles.imageContainer}
          onClick={async () => {
            imageModal.show({
              content: <PendingModal imageDetails={imageJob} />,
              maxWidth: 'max-w-[2000px]'
            })
          }}
          style={{
            paddingTop: `${aspectRatio}%`
          }}
        >
          {/* {imageJob.jobStatus === JobStatus.Done && (
            <div
              className={clsx(
                styles.FavButton,
                imageJob.favorited && styles.favorited
              )}
              onClick={(e) => handleFavClick(imageJob.jobId, e)}
            >
              <IconHeart
                fill={favorited ? 'red' : 'rgb(0,0,0,0)'}
                color="white"
                size={26}
                stroke={1}
              />
            </div>
          )} */}
          <div className={styles.ImagesComplete}>
            {imageJob.jobStatus === JobStatus.Done && (
              <div style={{ color: 'green' }}>
                <IconCheck size={18} />
              </div>
            )}
            ({imageJob.finished} / {imageJob.numImages})
          </div>
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
          {/* {imageJob.jobStatus !== JobStatus.Done && (
            <img
              alt="Pending image"
              src={placeholderImage.src}
              style={{
                borderRadius: '4px',
                maxWidth: '320px',
                height: `${imageJob.height}px`,
                width: `${imageJob.width}px`
              }}
            />
          )} */}
          {serverHasJob && (
            <div className={styles.CenteredElement}>
              <SpinnerV2 size={24} />
            </div>
          )}
          {imageJob.jobStatus === JobStatus.Waiting && (
            <div className={styles.CenteredElement}>
              <IconPhotoUp
                color="white"
                stroke={1.5}
                size={36}
                style={{ position: 'absolute' }}
              />
            </div>
          )}
          {imageJob.jobStatus === JobStatus.Error && (
            <div className={styles.CenteredElement}>
              <IconAlertTriangle
                color="rgb(234 179 8)"
                size={36}
                stroke={1}
                style={{ position: 'absolute' }}
              />
            </div>
          )}
          {imageJob.jobStatus === JobStatus.Done && imageSrcs[0] && (
            <img
              alt="Completed image"
              className={clsx(
                styles.InitImageState,
                isVisible && styles.ImageVisible
              )}
              height={imageJob.height}
              onLoad={() => setIsVisible(true)}
              src={imageSrcs[0]}
              style={{ borderRadius: '4px', cursor: 'pointer' }}
              width={imageJob.width}
            />
          )}
          {censoredJob && (
            <div className={styles.CenteredElement}>
              <IconAlertTriangle
                color="rgb(234 179 8)"
                stroke={1.5}
                size={36}
                style={{ position: 'absolute' }}
              />
            </div>
          )}
          {censoredJob && (
            <div className={styles.ImageStatus}>
              <div className="px-2 text-xs">
                The GPU worker was unable to complete this request. Try again?
                (Error code: X)
              </div>
            </div>
          )}
          {imageJob.jobStatus !== JobStatus.Done && (
            <div className={styles.ImageStatus}>
              {imageJob.jobStatus === JobStatus.Waiting && (
                <div>Preparing image request...</div>
              )}
              {imageJob.jobStatus === JobStatus.Requested && (
                <>Job requested...</>
              )}
              {imageJob.jobStatus === JobStatus.Queued && (
                <>
                  <div>
                    Job queued...{' '}
                    {imageJob.wait_time
                      ? `(~${Number(imageJob.wait_time)}s)`
                      : ''}
                  </div>
                  {!imageJob.wait_time && (
                    <div>(Estimating time remaining)</div>
                  )}
                  {Number(imageJob.queue_position) > 0 && (
                    <div>Queue position: {Number(imageJob.queue_position)}</div>
                  )}
                </>
              )}
              {imageJob.jobStatus === JobStatus.Processing && (
                <>
                  <div>
                    Processing...{' '}
                    {imageJob.wait_time
                      ? `(~${Number(imageJob.wait_time)}s)`
                      : ''}
                  </div>
                  {!imageJob.wait_time && <div>(Finishing up generation)</div>}
                </>
              )}
              {imageJob.jobStatus === JobStatus.Error && (
                <>
                  <div className="font-[700]">Error</div>
                  <div className="px-2 text-xs">{imageJob.errorMessage}</div>
                </>
              )}
              {imageJob.jobStatus === JobStatus.Queued &&
                imageJob.is_possible === false && (
                  <FlexRow gap={2}>⚠️ No workers for this job</FlexRow>
                )}
            </div>
          )}
        </div>
        {/* {imageSrcs.length > 1 && (
          <div className={clsx(styles.imageContainer, styles.imageContainer2)}>
            &nbsp;
          </div>
        )} */}
        {/* {imageSrcs.length > 2 && (
          <div className={clsx(styles.imageContainer, styles.imageContainer3)}>
            &nbsp;
          </div>
        )} */}
      </div>
    )
  }
)

PendingPanelImageCardV2.displayName = 'PendingPanelImageCard'
export default PendingPanelImageCardV2
