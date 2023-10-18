import SpinnerV2 from 'app/_components/Spinner'
import styles from './component.module.css'
import { JobStatus } from '_types'
import { useCallback, useEffect, useState } from 'react'
import { getJobImagesFromDexie } from 'app/_utils/db'
import clsx from 'clsx'
import AbTestModal from '../AbTestModal'
import { useModal } from '@ebay/nice-modal-react'
import ImageSquare from 'app/_modules/ImageSquare'
import { IconAlertTriangle, IconPhotoUp } from '@tabler/icons-react'

export default function ImageThumbnail({
  jobDetails,
  onImageClick = () => {},
  serverHasJob
}: {
  jobDetails: any
  onImageClick: (jobId: string) => any
  serverHasJob: boolean
}) {
  const abTestModal = useModal(AbTestModal)
  // const [showAbTestModal, setShowAbTestModal] = useState(false) // SDXL_beta
  const [secondaryImage, setSecondaryImage] = useState<string>('') // SDXL_beta
  const [secondaryId, setSecondaryId] = useState<string>('') // SDXL_beta
  const [isRated, setIsRated] = useState(false)

  const { jobId, jobStatus, ratingSubmitted } = jobDetails

  const getAdditionalImage = useCallback(async () => {
    const images = await getJobImagesFromDexie(jobId)
    const [image] = images

    if (image && 'base64String' in image) {
      setSecondaryImage(image.base64String)
      setSecondaryId(image.hordeImageId)
    }

    // Need to listen to change in jobStatus to fetch new images
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, jobStatus])

  const handleClick = useCallback(() => {
    // SDXL_beta
    if (secondaryImage && !isRated && !ratingSubmitted) {
      abTestModal.show({
        jobDetails,
        secondaryId,
        secondaryImage,
        setIsRated
      })
      return
    }

    onImageClick(jobId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRated, jobId, onImageClick, ratingSubmitted, secondaryImage])

  useEffect(() => {
    getAdditionalImage()
  }, [getAdditionalImage])

  return (
    <div className={styles.MobileImagesView}>
      {/* {showAbTestModal && (
        <AbTestModal
          handleClose={() => setShowAbTestModal(false)}
          jobDetails={jobDetails}
          secondaryId={secondaryId}
          secondaryImage={secondaryImage}
          setIsRated={setIsRated}
        />
      )} */}
      <div className={clsx(styles.ImageWrapper)}>
        {serverHasJob || jobDetails.jobStatus === JobStatus.Requested ? (
          <SpinnerV2 />
        ) : null}
        {jobDetails.jobStatus === JobStatus.Done && (
          <div onClick={handleClick} style={{ cursor: 'pointer' }}>
            <ImageSquare imageDetails={jobDetails} size={100} />
          </div>
        )}
        {jobDetails.jobStatus === JobStatus.Waiting && (
          <IconPhotoUp size={48} />
        )}
        {jobDetails.jobStatus === JobStatus.Error && (
          <IconAlertTriangle size={48} color="rgb(234 179 8)" stroke={1} />
        )}
      </div>
      {!isRated && !ratingSubmitted && secondaryImage && (
        <div className={clsx(styles.ImageWrapper)}>
          <div onClick={handleClick} style={{ cursor: 'pointer' }}>
            <ImageSquare
              imageDetails={{
                ...jobDetails,
                ...{ base64String: secondaryImage, thumbnail: '' }
              }}
              size={100}
            />
          </div>
        </div>
      )}
    </div>
  )
}
