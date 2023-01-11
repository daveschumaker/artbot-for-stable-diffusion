import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import CloseIcon from '../../icons/CloseIcon'
import Overlay from '../Overlay'
import { lockScroll, unlockScroll } from '../../../utils/appUtils'

interface IStyle {
  height: number | null
}

const CloseIconWrapper = styled.div`
  cursor: pointer;
  position: absolute;
  top: 8px;
  right: 8px;
`

const StyledInteractiveModal = styled.div<IStyle>`
  background-color: ${(props) => props.theme.body};
  border: 2px solid ${(props) => props.theme.border};
  border-radius: 8px;
  opacity: 1;
  top: 40px;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24px 16px 16px 16px;
  position: fixed;
  z-index: 20;

  @media (min-width: 640px) {
    width: calc(100% - 48px);
    /* max-width: 752px; */
    /* min-height: 480px; */
    height: ${(props) => (props.height ? props.height + 'px' : '512px')};
    max-height: ${(props) => (props.height ? props.height + 'px' : '512px')};
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    transition: all 150ms ease;
  }

  @media (min-width: 1280px) {
    max-width: 1008px;
  }
`

const ContentWrapper = styled.div`
  position: fixed;
  top: 86px;
  left: 0px;
  right: 0px;
  bottom: 0px;

  overflow-y: auto;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none;
  * {
    -ms-overflow-style: none;
  }
  ::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 640px) {
    top: 40px;
  }
`

const InteractiveModal = (props: any) => {
  const [height, setHeight] = useState(512)

  const keyDownHandler = (event: any) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      props?.handleClose()
    }
  }

  useEffect(() => {
    lockScroll()

    document.addEventListener('keydown', keyDownHandler)

    return () => {
      document.removeEventListener('keydown', keyDownHandler)
      unlockScroll()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isNaN(props.setDynamicHeight) && props.setDynamicHeight !== null) {
      setHeight(props.setDynamicHeight + 56)
    }
  }, [props.setDynamicHeight])

  return (
    <>
      <Overlay handleClose={props?.handleClose} />
      <StyledInteractiveModal height={height}>
        <ContentWrapper>{props.children}</ContentWrapper>
        <CloseIconWrapper onClick={props?.handleClose}>
          <CloseIcon size={28} />
        </CloseIconWrapper>
      </StyledInteractiveModal>
    </>
  )
}

export default InteractiveModal
