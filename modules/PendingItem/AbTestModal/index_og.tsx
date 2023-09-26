/* eslint-disable @next/next/no-img-element */
import { useCallback, useState } from 'react'
import { Button } from 'app/_components/Button'
import { clientHeader, getApiHostServer } from 'utils/appUtils'
import AppSettings from 'models/AppSettings'
import {
  deleteCompletedImage,
  deleteImageFromDexie,
  getImageDetails,
  updateCompletedJob,
  updatePendingJobInDexie
} from 'utils/db'
import {
  deletePendingJob,
  updatePendingJobProperties
} from 'controllers/pendingJobsCache'
import { IconDeviceFloppy, IconTrash, IconTrashX } from '@tabler/icons-react'

import Carousel from 'react-gallery-carousel'
import 'react-gallery-carousel/dist/index.css'
import FlexCol from 'app/_components/FlexCol'

function AbTestModal({
  handleClose = () => {},
  jobDetails,
  modalHeight,
  secondaryId,
  secondaryImage,
  setIsRated = () => {}
}: {
  handleClose?: () => any
  jobDetails: any
  modalHeight?: number
  secondaryId: string
  secondaryImage: string
  setIsRated: (value: boolean) => any
}) {
  const [selectedImg, setSelectedImg] = useState(0)
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
    await handleRateImage()

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

  const images = [
    { src: 'data:image/webp;base64,' + jobDetails.base64String },
    { src: 'data:image/webp;base64,' + secondaryImage }
  ]

  console.log(`modalHeight?`, modalHeight, jobDetails.height)

  return (
    <div id="abtest-wrapper" style={{ maxHeight: modalHeight }}>
      <style>
        {`
          #sdxl-abtest-content>div>div>div>ul>li>figure {
            background-color: var(--body-color);

            margin: 0 auto;
            max-width: 500px; /* Set the maximum width of the parent div */
            max-height: 500px; /* Set the maximum height of the parent div */
            height: auto; /* Allow the height to adjust based on the image */
            display: flex; /* Enable flexbox for centering the image */
            justify-content: center; /* Center the image horizontally */
            align-items: center;
          }

          #sdxl-abtest-content>div>div>div>ul>li>figure>img {
            border: unset !important;
            border-bottom: unset !important;
            margin: 0 auto;

            max-width: 100%; /* Set the maximum width of the image to fit its parent */
            max-height: 100%; /* Set the maximum height of the image to fit its parent */
            height: auto; /* Allow the height to adjust based on the image */
            width: auto;
          }
      `}
      </style>
      <div id="sdxl-abtest-content" tabIndex={0}>
        <Carousel
          hasMediaButton={false}
          hasSizeButton={false}
          hasThumbnails={false}
          widgetsHasShadow={true}
          images={images}
          transitionSpeed={4}
          style={{
            backgroundColor: 'unset',
            maxHeight: `${Number(modalHeight) - 128}px`
          }}
          index={selectedImg}
          onIndexChange={({ curIndex, curIndexForDisplay }) => {
            setSelectedImg(curIndex)
            return { curIndex, curIndexForDisplay }
          }}
        />
      </div>
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
    </div>
  )
}

export default AbTestModal
