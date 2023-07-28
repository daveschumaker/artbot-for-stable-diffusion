/* eslint-disable @next/next/no-img-element */
import styled from 'styled-components'
import { useSwipeable } from 'react-swipeable'

import { setNewImageReady, setShowImageReadyToast } from 'store/appStore'
import { useEffect, useState } from 'react'
import { trackEvent, trackGaEvent } from 'api/telemetry'
import { getImageDetails } from 'utils/db'
import ImageSquare from 'components/ImageSquare'
import CloseIcon from 'components/icons/CloseIcon'
import Linker from 'components/UI/Linker'
import AppSettings from 'models/AppSettings'

const StyledToast = styled.div`
  align-items: center;
  background-color: var(--body-color);
  border-radius: 4px;
  border: 2px solid var(--border-color);
  box-shadow: 0 3px 10px rgb(0 0 0 / 0.2);
  color: ${(props) => props.theme.text};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  height: 96px;
  padding: 8px;
  position: fixed;
  right: 8px;
  top: ${(props) =>
    props.active ? 'calc(env(safe-area-inset-top) + 8px)' : '-200px'};
  transition: all 0.4s;
  width: 300px;
  z-index: 26;
`

const StyledClose = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
`

const StyledTextPanel = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  height: 80px;
  justify-content: space-between;
  padding-top: 20px;
  padding-bottom: 8px;
  padding-left: 8px;
`

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

  const [imageDetails, setImageDetails] = useState({})

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
    <StyledToast active={isActive} {...handlers}>
      {isActive && (
        <>
          <div>
            <Linker
              disableLinkClick
              href={`/image/${jobId}`}
              onClick={handleClick}
            >
              <ImageSquare imageDetails={imageDetails} size={80} />
            </Linker>
          </div>
          <StyledTextPanel>
            <div>Your new image is ready.</div>
            <Linker
              disableLinkClick
              href={`/image/${jobId}`}
              onClick={handleClick}
            >
              Check it out!
            </Linker>
          </StyledTextPanel>
          <StyledClose onClick={handleClose}>
            <CloseIcon />
          </StyledClose>
        </>
      )}
    </StyledToast>
  )
}
