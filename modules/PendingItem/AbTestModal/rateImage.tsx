import { IconDeviceFloppy, IconTrash, IconTrashX } from '@tabler/icons-react'
import { Button } from 'app/_components/Button'
import FlexCol from 'app/_components/FlexCol'
import {
  deletePendingJob,
  updatePendingJobProperties
} from 'controllers/pendingJobsCache'
import AppSettings from 'models/AppSettings'
import { useCallback } from 'react'
import { clientHeader, getApiHostServer } from 'utils/appUtils'
import {
  deleteCompletedImage,
  deleteImageFromDexie,
  getImageDetails,
  updateCompletedJob,
  updatePendingJobInDexie
} from 'utils/db'

interface Props {
  handleClose: () => any
  jobDetails: any
  selectedImg: number
  secondaryId: string
  secondaryImage: string
  setIsRated: (bool: boolean) => any
}

export default function RateAbTestImage({
  handleClose,
  jobDetails,
  secondaryId,
  secondaryImage,
  selectedImg,
  setIsRated
}: Props) {
  const handleRateImage = useCallback(async () => {
    const imageId = selectedImg === 0 ? jobDetails.hordeImageId : secondaryId

    try {
      await fetch(
        `${getApiHostServer()}/api/v2/generate/rate/${jobDetails.jobId}`,
        {
          method: 'POST',
          body: JSON.stringify({
            best: imageId
          }),
          headers: {
            'Content-Type': 'application/json',
            'Client-Agent': clientHeader(),
            apikey: AppSettings.get('apiKey')
          }
        }
      )

      return true
    } catch (e) {
      console.log(e)
      return false
    }
  }, [jobDetails.hordeImageId, jobDetails.jobId, secondaryId, selectedImg])

  const handleRateSaveBoth = useCallback(async () => {
    handleRateImage()

    const imageDetailsFromCompleted = await getImageDetails(jobDetails.jobId)

    updatePendingJobProperties(jobDetails.jobId, {
      base64String:
        selectedImg === 0 ? jobDetails.base64String : secondaryImage,
      jobId: selectedImg === 0 ? jobDetails.jobId : jobDetails.sdxlCompanionJob,
      ratingSubmitted: true,
      thumbnail: null
    })

    await updatePendingJobInDexie(jobDetails.id, {
      base64String:
        selectedImg === 0 ? jobDetails.base64String : secondaryImage,
      ratingSubmitted: true,
      thumbnail: null
    })

    await updateCompletedJob(imageDetailsFromCompleted.id, {
      ratingSubmitted: true,
      thumbnail: null
    })

    await deleteImageFromDexie(jobDetails.jobId)

    setIsRated(true)
    handleClose()
  }, [
    handleClose,
    handleRateImage,
    jobDetails.base64String,
    jobDetails.id,
    jobDetails.jobId,
    jobDetails.sdxlCompanionJob,
    secondaryImage,
    selectedImg,
    setIsRated
  ])

  const handleRateDeleteOther = useCallback(async () => {
    await handleRateImage()

    const imageDetailsFromCompleted = await getImageDetails(jobDetails.jobId)

    updatePendingJobProperties(jobDetails.jobId, {
      base64String:
        selectedImg === 0 ? jobDetails.base64String : secondaryImage,
      ratingSubmitted: true,
      thumbnail: null
    })

    await updatePendingJobInDexie(jobDetails.id, {
      base64String:
        selectedImg === 0 ? jobDetails.base64String : secondaryImage,
      ratingSubmitted: true,
      thumbnail: null
    })

    await updateCompletedJob(imageDetailsFromCompleted.id, {
      base64String:
        selectedImg === 0 ? jobDetails.base64String : secondaryImage,
      ratingSubmitted: true,
      thumbnail: null,
      sdxlCompanionJob: null
    })

    await deleteCompletedImage(jobDetails.sdxlCompanionJob)
    await deleteImageFromDexie(jobDetails.jobId)

    setIsRated(true)
    handleClose()
  }, [
    handleClose,
    handleRateImage,
    jobDetails.base64String,
    jobDetails.id,
    jobDetails.jobId,
    jobDetails.sdxlCompanionJob,
    secondaryImage,
    selectedImg,
    setIsRated
  ])

  const handleRateDeleteBoth = useCallback(async () => {
    await handleRateImage()

    await deleteCompletedImage(jobDetails.jobId)
    await deleteCompletedImage(jobDetails.sdxlCompanionJob)
    deletePendingJob(jobDetails.jobId)

    setIsRated(true)
    handleClose()
  }, [
    handleClose,
    handleRateImage,
    jobDetails.jobId,
    jobDetails.sdxlCompanionJob,
    setIsRated
  ])

  return (
    <FlexCol
      gap={8}
      style={{
        marginTop: '12px',
        alignItems: 'center'
      }}
    >
      <Button
        onClick={() => {
          handleRateSaveBoth()
        }}
        style={{ minWidth: '260px' }}
      >
        <IconDeviceFloppy stroke={1.5} />
        Select as favorite (save both)
      </Button>
      <Button
        onClick={() => {
          handleRateDeleteOther()
        }}
        style={{ minWidth: '260px' }}
      >
        <IconTrashX stroke={1.5} />
        Select as favorite (delete other)
      </Button>
      <Button
        onClick={() => {
          handleRateDeleteBoth()
        }}
        theme="secondary"
        style={{ minWidth: '260px' }}
      >
        <IconTrash stroke={1.5} />
        Select as favorite (delete both)
      </Button>
    </FlexCol>
  )
}
