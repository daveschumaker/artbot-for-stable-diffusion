/* eslint-disable @next/next/no-img-element */
import { useSwipeable } from 'react-swipeable'

import { setNewImageReady, setShowImageReadyToast } from 'app/_store/appStore'
import { useEffect, useState } from 'react'
import { trackEvent, trackGaEvent } from 'app/_api/telemetry'
import { getImageDetails } from 'app/_utils/db'
import Linker from 'app/_components/Linker'
import AppSettings from 'app/_data-models/AppSettings'
import styles from './toast.module.css'
import { JobImageDetails } from '_types'
import ImageSquare from '../ImageSquare'
import { IconX } from '@tabler/icons-react'

interface ToastProps {
  disableAutoClose: boolean
  handleClose: () => any
  handleImageClick: () => any
  jobId: string
  showImageReadyToast: boolean
}

export default function Toast({
  disableAutoClose = false,
  handleClose,
  handleImageClick,
  jobId,
  showImageReadyToast
}: ToastProps) {
  const handlers = useSwipeable({
    onSwipedRight: () => {
      handleClose()
    },
    onSwipedUp: () => {
      handleClose()
    },
    preventScrollOnSwipe: true,
    swipeDuration: 250,
    trackTouch: true,
    delta: 35
  })

  const [imageDetails, setImageDetails] = useState<JobImageDetails>()

  const fetchImageDetails = async (jobId: string) => {
    const details = await getImageDetails(jobId)
    setImageDetails(details)
  }

  const handleClick = () => {
    trackEvent({
      event: 'NEW_IMAGE_TOAST_CLICK'
    })
    trackGaEvent({
      action: 'toast_click',
      params: {
        type: 'new_img'
      }
    })
    handleImageClick()

    if (!disableAutoClose) {
      setShowImageReadyToast(false)
      setNewImageReady('')
      handleClose()
    }
  }

  useEffect(() => {
    if (jobId) {
      fetchImageDetails(jobId)
    }
  }, [jobId])

  useEffect(() => {
    const interval = setTimeout(async () => {
      if (!disableAutoClose) {
        handleClose()
      }
    }, 5000)
    return () => clearInterval(interval)
  })

  const isActive =
    jobId && imageDetails && imageDetails.base64String && showImageReadyToast

  if (!isActive || AppSettings.get('disableNewImageNotification')) {
    return null
  }

  return (
    <div
      className={`${styles.toast} ${isActive ? styles.active : ''}`}
      {...handlers}
    >
      {isActive && (
        <>
          <div>
            <Linker
              disableLinkClick
              href={`/image/${jobId}`}
              onClick={handleClick}
            >
              <ImageSquare imageDetails={imageDetails} size={60} />
            </Linker>
          </div>
          <div className={styles.textPanel} style={{ paddingLeft: '12px' }}>
            <div>Your new image is ready.</div>
            <Linker
              disableLinkClick
              href={`/image/${jobId}`}
              onClick={handleClick}
            >
              Check it out!
            </Linker>
          </div>
          <div onClick={handleClose} className={styles.close}>
            <IconX />
          </div>
        </>
      )}
    </div>
  )
}
