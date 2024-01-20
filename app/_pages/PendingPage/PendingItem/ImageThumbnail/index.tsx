import SpinnerV2 from 'app/_components/Spinner'
import styles from './component.module.css'
import { JobStatus } from '_types'
import { useCallback, useState } from 'react'
import clsx from 'clsx'
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
  const [isRated] = useState(false)

  const { jobId, ratingSubmitted } = jobDetails

  const handleClick = useCallback(() => {
    onImageClick(jobId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRated, jobId, onImageClick, ratingSubmitted])

  return (
    <div className={styles.MobileImagesView}>
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
    </div>
  )
}
