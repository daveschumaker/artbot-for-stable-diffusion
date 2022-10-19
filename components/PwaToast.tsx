/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useWindowSize } from '../hooks/useWindowSize'
import { isInstalledPwa } from '../utils/appUtils'
import CloseIcon from './icons/CloseIcon'

const StyledToast = styled.div`
  align-items: center;
  background-color: #8cc7ff;
  border: 2px solid white;
  border-radius: 8px;
  bottom: 20px;
  color: white;
  display: flex;
  flex-direction: row;
  font-family: monospace;
  font-size: 14px;
  font-weight: bold;
  height: 130px;
  left: 0;
  margin: 0 auto;
  padding: 8px;
  position fixed;
  text-align: center;
  right: 0;
  width: 340px;
`

const StyledClose = styled(CloseIcon)`
  position: absolute;
  top: 8px;
  right: 8px;
`

const PwaToast = () => {
  const size = useWindowSize()
  const [showToast, setShowToast] = useState(false)

  const handleHideToast = () => {
    localStorage.setItem('hidePwaToast', 'true')
    setShowToast(false)
  }

  useEffect(() => {
    if (isInstalledPwa()) {
      return
    }

    if (localStorage.getItem('hidePwaToast') === 'true') {
      return
    }

    // @ts-ignore
    const mobileSize = size?.width <= 640 || false

    if (mobileSize) {
      setShowToast(true)
    }
  }, [size.width])

  if (!showToast) {
    return null
  }

  return (
    <StyledToast onClick={handleHideToast}>
      <StyledClose />
      <img
        src="/artbot/artbot-logo.png"
        className="inline-block mr-2"
        alt="ArtBot logo"
      />
      For the best experience, add ArtBot to your home screen!
    </StyledToast>
  )
}

export default PwaToast
