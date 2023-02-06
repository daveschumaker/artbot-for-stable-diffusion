import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import CloseIcon from '../../icons/CloseIcon'
import Overlay from '../Overlay'
import { lockScroll, unlockScroll } from '../../../utils/appUtils'
import { useSwipeable } from 'react-swipeable'

interface IStyle {
  height: number | null
  startAnimation: boolean
}

const CloseIconWrapper = styled.div`
  cursor: pointer;
  position: absolute;
  top: 8px;
  right: 8px;
`

const SwipeCapture = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 75px;

  @media (min-width: 640px) {
    display: none;
  }
`

const StyledInteractiveModal = styled.div<IStyle>`
  background-color: ${(props) => props.theme.body};
  border-top: 2px solid ${(props) => props.theme.border};
  border-radius: 8px;
  opacity: 1;
  top: 40px;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24px 16px 16px 16px;
  position: fixed;
  z-index: 20;

  transform: translateY(110%);
  transition: all 250ms ease-in-out;

  ${(props) =>
    props.startAnimation &&
    `
    transform: translateX(0%);
  `}

  @media (min-width: 640px) {
    border: 2px solid ${(props) => props.theme.border};
    max-width: 864px;
    width: calc(100% - 48px);
    /* max-width: 752px; */
    /* min-height: 480px; */
    height: ${(props) => (props.height ? props.height + 'px' : '512px')};
    max-height: ${(props) => (props.height ? props.height + 'px' : '512px')};
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    transition: all 50ms ease;
  }

  @media (min-width: 1280px) {
    max-width: 1088px;
    width: calc(100% - 48px);
  }
`

const ContentWrapper = styled.div`
  position: fixed;
  top: 40px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  margin: 0 8px;

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
  const { handleClose = () => {} } = props
  const [startAnimation, setStartAnimation] = useState(false)
  const [height, setHeight] = useState(512)

  const handlers = useSwipeable({
    onSwipedDown: () => {
      onClose()
    },
    preventScrollOnSwipe: true,
    swipeDuration: 250,
    delta: 150
  })

  const keyDownHandler = (event: any) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      props?.handleClose()
    }
  }

  const onClose = () => {
    setStartAnimation(false)
    setTimeout(() => {
      handleClose()
    }, 150)
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

  useEffect(() => {
    setStartAnimation(true)
  }, [])

  return (
    <>
      <Overlay handleClose={onClose} />
      <StyledInteractiveModal height={height} startAnimation={startAnimation}>
        <ContentWrapper>{props.children}</ContentWrapper>
        <SwipeCapture {...handlers} />
        <CloseIconWrapper onClick={onClose}>
          <CloseIcon size={28} />
        </CloseIconWrapper>
      </StyledInteractiveModal>
    </>
  )
}

export default InteractiveModal
