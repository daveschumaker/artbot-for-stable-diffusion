/* eslint-disable @next/next/no-img-element */
import { JobStatus } from '_types'
import NiceModal, { useModal } from '@ebay/nice-modal-react'

import clsx from 'clsx'
import { deletePendingJob } from 'app/_controllers/pendingJobsCache'
import { deletePendingJobFromApi } from 'app/_api/deletePendingJobFromApi'
import {
  IconAlertTriangle,
  IconCheck,
  IconPhotoUp,
  IconTrash,
  IconX
} from '@tabler/icons-react'
import SpinnerV2 from 'app/_components/Spinner'
import React, { useCallback, useEffect, useState } from 'react'
import FlexRow from 'app/_components/FlexRow'
import { getAllImagesByJobId } from 'app/_db/image_files'
import CreateImageRequestV2 from 'app/_data-models/v2/CreateImageRequestV2'
import styles from './component.module.css'
import ImageModel from 'app/_data-models/v2/ImageModel'
import { deleteJobIdFromCompleted } from 'app/_db/transactions'
import { arraysEqual } from 'app/_utils/helperUtils'
import ImageModalV3 from 'app/_modules/ImageModalV3'

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
    const [censoredJob, setCensoredJob] = useState(false)
    const [isVisible, setIsVisible] = useState(
      imageJob.jobStatus === JobStatus.Done
    )
    const [imageSrcs, setImageSrcs] = useState<string[]>([])

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

    const hideFromPending = useCallback(
      async (jobId: string, jobStatus: JobStatus, e: any) => {
        e.stopPropagation()

        const serverHasJob =
          jobStatus === JobStatus.Queued || jobStatus === JobStatus.Processing

        if (serverHasJob) {
          deletePendingJobFromApi(jobId)
        }

        if (censoredJob && imageJob.jobStatus === JobStatus.Done) {
          console.log(`Completely deleting this whole thing...`)
          await deleteJobIdFromCompleted(jobId)
        }

        deletePendingJob(jobId)
      },
      [censoredJob, imageJob.jobStatus]
    )

    const loadImage = useCallback(async () => {
      const srcs: string[] = []
      const data = (await getAllImagesByJobId(imageJob.jobId)) as ImageModel[]

      data.forEach((image: ImageModel) => {
        if (!image) return

        if (image.blob) {
          srcs.push(URL.createObjectURL(image.blob))
        }
      })

      if (imageJob.numImages === imageJob.images_censored) {
        setCensoredJob(true)
      }

      if (!arraysEqual(srcs, imageSrcs)) {
        setImageSrcs(srcs)
      }
      // Need to listen to changes in imageJob.finished in order for the finished
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      imageJob.images_censored,
      imageJob.jobId,
      imageJob.numImages,
      imageSrcs,
      imageJob.finished
    ])

    useEffect(() => {
      // if (!imageSrcs[0] && imageJob.jobStatus === JobStatus.Done) {
      //   loadImage()
      // }

      if (!imageSrcs[0]) {
        loadImage()
      }

      return () => {
        if (imageSrcs[0]) URL.revokeObjectURL(imageSrcs[0])
      }
    }, [imageSrcs, loadImage, imageJob.jobStatus, imageJob.finished])

    let aspectRatio = (imageJob.height / imageJob.width) * 100 // This equals 66.67%

    const [jobDone, setJobDone] = useState(false)
    const [jobDoneHasImages, setJobDoneHasImages] = useState(false)
    const [jobPendingHasImages, setJobPendingHasImages] = useState(false)
    const [jobHasError, setJobHasError] = useState(false)

    useEffect(() => {
      const isJobDone = imageJob.jobStatus === JobStatus.Done
      const isJobDoneHasImages = isJobDone && imageSrcs[0]
      const isJobPendingHasImages = !isJobDone && imageSrcs[0]
      const isJobHasError =
        imageJob.jobStatus === JobStatus.Error || imageJob.images_censored > 0

      setJobDone(isJobDone)
      setJobDoneHasImages(isJobDoneHasImages ? true : false)
      setJobPendingHasImages(isJobPendingHasImages ? true : false)
      setJobHasError(isJobHasError)
    }, [imageJob.images_censored, imageJob.jobStatus, imageSrcs])

    const imagesCompleted = isNaN(imageJob.finished - imageJob.images_censored)
      ? 0
      : imageJob.finished - imageJob.images_censored

    return (
      <div className={clsx(styles.PendingJobCard)} key={imageJob.jobId}>
        <div
          className={styles.imageContainer}
          onClick={async () => {
            NiceModal.show('image-modal', {
              content: <ImageModalV3 imageDetails={imageJob} />,
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
            {jobDone && !jobHasError && (
              <div style={{ color: 'green' }}>
                <IconCheck size={18} />
              </div>
            )}
            {jobHasError && (
              <div>
                <IconAlertTriangle size={18} color="rgb(234 179 8)" />
              </div>
            )}
            ({imagesCompleted} / {imageJob.numImages})
          </div>
          <div
            className={styles.CloseButton}
            onClick={(e) =>
              hideFromPending(imageJob.jobId, imageJob.jobStatus, e)
            }
            style={{ zIndex: 2 }}
          >
            <IconX color="white" stroke={1} />
          </div>
          {jobDone && !censoredJob && (
            <div
              className={styles.TrashButton}
              onClick={(e) => handleDeleteImage(imageJob.jobId, e)}
              style={{ zIndex: 2 }}
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
          {jobDoneHasImages && (
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
          {((!jobDone && serverHasJob && imageSrcs[0]) ||
            (!jobDone && jobHasError && imageSrcs[0])) && (
            <img
              alt="Images in progress image"
              className={clsx(
                styles.InitImageState,
                isVisible && styles.ImageVisible,
                styles['darken-img']
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
