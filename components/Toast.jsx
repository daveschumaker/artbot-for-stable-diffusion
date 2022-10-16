/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router'
import Link from 'next/link'
import styled from 'styled-components'

import { setNewImageReady, setShowImageReadyToast } from '../store/appStore'
import { useEffect, useState } from 'react'
import { trackEvent } from '../api/telemetry'
import { getImageDetails } from '../utils/db'
import ImageSquare from './ImageSquare'
import CloseIcon from './icons/CloseIcon'

const StyledToast = styled.div`
  align-items: center;
  background-color: #282828;
  border-radius: 4px;
  border: 2px solid white;
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
  z-index: 10;
`

const StyledClose = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
`;


export default function Toast({ handleClose, jobId, showImageReadyToast }) {
  const router = useRouter()
  const [imageDetails, setImageDetails] = useState({})

  const fetchImageDetails = async (jobId) => {
    const details = await getImageDetails(jobId)
    setImageDetails(details)
  }

  const handleClick = () => {
    trackEvent({
      event: 'NEW_IMAGE_TOAST_CLICK'
    })
    router.push(`/image/${jobId}`)

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
    <StyledToast active={isActive} role="alert">
      {isActive && (
        <>
          <Link href={`/image/${jobId}`}>
            <a onClick={handleClick}>
              <div className="mt-[4px]">
                <ImageSquare imageDetails={imageDetails} size={80} />
              </div>
            </a>
          </Link>
          <div className="flex-col">
            <div className="ml-4 text-sm font-normal text-white">Your new image is ready.</div>
            <Link href={`/image/${jobId}`}>
              <a onClick={handleClick}>
                <div className="ml-4 text-sm font-normal text-cyan-400">Check it out!</div>
              </a>
            </Link >
          </div>
          <StyledClose onClick={handleClose}>
            <CloseIcon />
          </StyledClose>
        </>
      )}
    </StyledToast >
  )
}
