/* eslint-disable @next/next/no-img-element */
import styled from 'styled-components'

import { setNewImageReady, setShowImageReadyToast } from '../../store/appStore'
import { useEffect, useState } from 'react'
import { trackEvent, trackGaEvent } from '../../api/telemetry'
import { getImageDetails } from '../../utils/db'
import ImageSquare from '../ImageSquare'
import CloseIcon from '../icons/CloseIcon'
import Linker from './Linker'

const StyledToast = styled.div`
  align-items: center;
  background-color: ${(props) => props.theme.body};
  border-radius: 4px;
  border: 2px solid ${(props) => props.theme.border};
  box-shadow: 0 3px 10px rgb(0 0 0 / 0.2);
  color: ${(props) => props.theme.text};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  height: 96px;
  padding: 8px;
  position: fixed;
  right: 8px;
  top: ${(props) => (props.active ? '8px' : '-200px')};
  transition: all 0.4s;
  width: 300px;
  z-index: 25;
`

const StyledClose = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
`;

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

export default function Toast({ handleClose, handleImageClick, jobId, showImageReadyToast }) {
  const [imageDetails, setImageDetails] = useState({})

  const fetchImageDetails = async (jobId) => {
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

    setShowImageReadyToast(false)
    setNewImageReady('')
    handleClose()
  }

  useEffect(() => {
    if (jobId) {
      fetchImageDetails(jobId)
    }
  }, [jobId])

  useEffect(() => {
    const interval = setTimeout(async () => {
      handleClose()
    }, 5000)
    return () => clearInterval(interval)
  })

  const isActive = jobId && imageDetails.base64String && showImageReadyToast

  return (
    <StyledToast active={isActive}>
      {isActive && (
        <>
          <div>
            <Linker disableLinkClick href={`/image/${jobId}`} onClick={handleClick}>
              <ImageSquare imageDetails={imageDetails} size={80} />
            </Linker>
          </div>
          <StyledTextPanel>
            <div>Your new image is ready.</div>
            <Linker href={`/image/${jobId}`} onClick={handleClick}>
              Check it out!
            </Linker >
          </StyledTextPanel>
          <StyledClose onClick={handleClose}>
            <CloseIcon />
          </StyledClose>
        </>
      )}
    </StyledToast >
  );
}
