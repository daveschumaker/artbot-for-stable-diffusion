/* eslint-disable @next/next/no-img-element */
import PageTitle from 'app/_components/PageTitle'
import styles from './component.module.css'
import { useCallback, useEffect, useState } from 'react'
import { Button } from 'app/_components/Button'
import { clientHeader, getApiHostServer } from 'app/_utils/appUtils'
import AppSettings from 'app/_data-models/AppSettings'
import {
  deleteCompletedImage,
  deleteImageFromDexie,
  getImageDetails,
  updateCompletedJob,
  updatePendingJobInDexie
} from 'app/_utils/db'
import {
  deletePendingJob,
  updatePendingJobProperties
} from 'app/_controllers/pendingJobsCache'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import Overlay from 'app/_components/Overlay'
import {
  IconDeviceFloppy,
  IconInfoHexagon,
  IconTrash,
  IconTrashX,
  IconX
} from '@tabler/icons-react'

import Carousel from 'react-gallery-carousel'
import 'react-gallery-carousel/dist/index.css'
import FlexRow from 'app/_components/FlexRow'
import TooltipComponent from 'app/_components/TooltipComponent'
import useLockedBody from 'app/_hooks/useLockedBody'
import FlexCol from 'app/_components/FlexCol'

function AbTestModal({
  jobDetails,
  secondaryId,
  secondaryImage,
  setIsRated = () => {}
}: {
  jobDetails: any
  secondaryId: string
  secondaryImage: string
  setIsRated: (value: boolean) => any
}) {
  const modal = useModal()
  const [, setLocked] = useLockedBody(false)
  const [selectedImg, setSelectedImg] = useState(0)
  const [modalHeight, setModalHeight] = useState<string | number>('auto')

  const updateModalHeight = () => {
    const maxHeight = window.innerHeight - 64 // 64px is subtracted for header/footer
    setModalHeight(maxHeight)
  }

  const handleClose = useCallback(() => {
    modal.remove()
  }, [modal])

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

  useEffect(() => {
    if (modal.visible) {
      updateModalHeight()
      window.addEventListener('resize', updateModalHeight)
      setLocked(true)
      return () => {
        setLocked(false)
        window.removeEventListener('resize', updateModalHeight)
      }
    }
  }, [modal.visible, setLocked])

  if (!modal.visible) {
    return null
  }

  const images = [
    { src: 'data:image/webp;base64,' + jobDetails.base64String },
    { src: 'data:image/webp;base64,' + secondaryImage }
  ]

  return (
    <>
      <style>
        {`
          #sdxl-abtest-content>div>div>div>ul>li>figure {
            background-color: var(--body-color);
          }

          #sdxl-abtest-content>div>div>div>ul>li>figure>img {
            border: unset !important;
            border-bottom: unset !important;
            height: unset;
            margin: 0 auto;
            max-height: ${Number(modalHeight) - 132}px;
            width: unset;
          }
      `}
      </style>
      <Overlay handleClose={handleClose} />
      <div className={styles.ModalStyle} style={{ maxHeight: modalHeight }}>
        <div className={styles['close-btn']} onClick={handleClose}>
          <IconX stroke={1.5} size={28} />
        </div>
        <PageTitle>
          <FlexRow gap={4}>
            <IconInfoHexagon />
            SDXL Beta
            <TooltipComponent tooltipId="sdxl-beta-tooltip-modal">
              SDXL is currently in beta and provided by Stability.ai in order to
              refine future image models. Please select one of the following two
              images to choose as the best image for this particular generation.
              You will be rewarded 15 kudos for each rating.
            </TooltipComponent>
          </FlexRow>
          <div style={{ fontWeight: 400, fontSize: '14px', marginTop: '-4px' }}>
            Choose which image you think is best:
          </div>
        </PageTitle>
        <div
          id="sdxl-abtest-content"
          className={styles.ModalContent}
          tabIndex={0}
        >
          <Carousel
            hasMediaButton={false}
            hasSizeButton={false}
            hasThumbnails={false}
            widgetsHasShadow={true}
            images={images}
            transitionSpeed={4}
            style={{
              backgroundColor: 'unset',
              maxHeight: `${Number(modalHeight) - 240}px`
            }}
            index={selectedImg}
            onIndexChange={({ curIndex, curIndexForDisplay }) => {
              setSelectedImg(curIndex)
              return { curIndex, curIndexForDisplay }
            }}
          />
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
      </div>
    </>
  )
}

export default NiceModal.create(AbTestModal)
