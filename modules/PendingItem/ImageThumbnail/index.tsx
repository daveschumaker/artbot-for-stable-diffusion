import SpinnerV2 from 'components/Spinner'
import styles from './component.module.css'
import AlertTriangleIcon from 'components/icons/AlertTriangle'
import { JobStatus } from 'types'
import ImageSquare from 'components/ImageSquare'
import PhotoUpIcon from 'components/icons/PhotoUpIcon'

export default function ImageThumbnail({
  jobDetails,
  onImageClick = () => {},
  serverHasJob
}: {
  jobDetails: any
  onImageClick: (jobId: string) => any
  serverHasJob: boolean
}) {
  const { jobId } = jobDetails

  return (
    <div className={styles.ImageWrapper}>
      {serverHasJob || jobDetails.jobStatus === JobStatus.Requested ? (
        <SpinnerV2 />
      ) : null}
      {jobDetails.jobStatus === JobStatus.Done && (
        <div onClick={() => onImageClick(jobId)} style={{ cursor: 'pointer' }}>
          <ImageSquare imageDetails={jobDetails} size={100} />
        </div>
      )}
      {jobDetails.jobStatus === JobStatus.Waiting && <PhotoUpIcon size={48} />}
      {jobDetails.jobStatus === JobStatus.Error && (
        <AlertTriangleIcon size={48} stroke="rgb(234 179 8)" />
      )}
    </div>
  )
}
