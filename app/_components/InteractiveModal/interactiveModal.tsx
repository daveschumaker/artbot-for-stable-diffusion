import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import Overlay from 'app/_components/Overlay'
import { useSwipeable } from 'react-swipeable'
import clsx from 'clsx'
import useLockedBody from 'app/_hooks/useLockedBody'
import styles from './modal.module.css'
import { IconX } from '@tabler/icons-react'

interface IStyle {
  height: number | null
  maxWidth?: string
  startAnimation: boolean
}

const CloseIconWrapper = styled.div`
  cursor: pointer;
  position: absolute;
  top: 8px;
  right: 8px;
`

const LeftIconWrapper = styled.div`
  cursor: pointer;
  position: absolute;
  top: 8px;
  left: 8px;
`

const SwipeCapture = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 150px;

  @media (min-width: 640px) {
    display: none;
  }
`

const StyledInteractiveModal = styled.div<IStyle>`
  background-color: var(--body-color);
  border-top: 2px solid var(--border-color);
  border-radius: 8px;
  opacity: 1;
  height: 100%;
  top: 48px;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24px 16px 16px 16px;
  position: fixed;
  z-index: 30;

  transform: translateY(110%);
  transition: all 250ms ease-in-out;

  ${(props) =>
    props.startAnimation &&
    `
    transform: translateX(0%);
  `}

  @media (min-width: 640px) {
    border: 2px solid var(--border-color);
    max-width: ${(props) => props.maxWidth || '864px'};
    width: calc(100% - 48px) !important;
    height: ${(props) => (props.height ? props.height + 'px' : '512px')};
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    transition: all 50ms ease;
  }

  @media (min-width: 1280px) {
    max-width: ${(props) => props.maxWidth || '1088px'};
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

interface Props {
  children: React.ReactNode
  className?: string
  disableSwipe?: boolean
  handleClose: () => any
  leftButton?: boolean
  maxHeight?: string
  maxWidth?: string
  setDynamicHeight?: number
  title?: string
}

const InteractiveModal = (props: Props) => {
  const [, setLocked] = useLockedBody(false)

  const {
    className = '',
    disableSwipe = false,
    handleClose = () => {},
    setDynamicHeight = 512,
    title = '',
    leftButton,
    maxHeight = '100%'
  } = props
  const [startAnimation, setStartAnimation] = useState(false)
  const [height, setHeight] = useState(512)

  const handlers = useSwipeable({
    onSwipedDown: () => {
      onClose()
    },
    preventScrollOnSwipe: true,
    swipeDuration: 250,
    trackTouch: true,
    delta: 35
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
    setLocked(true)

    document.addEventListener('keydown', keyDownHandler)

    return () => {
      document.removeEventListener('keydown', keyDownHandler)
      setLocked(false)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isNaN(setDynamicHeight) && setDynamicHeight !== null) {
      setHeight(setDynamicHeight + 56)
    }
  }, [setDynamicHeight])

  useEffect(() => {
    setStartAnimation(true)
  }, [])

  return (
    <>
      <Overlay handleClose={onClose} />
      <StyledInteractiveModal
        className={clsx(className)}
        height={height}
        startAnimation={startAnimation}
        maxWidth={props.maxWidth}
        style={{ maxHeight }}
      >
        {title && <div className={styles.ModalTitle}>{title}</div>}
        <ContentWrapper>{props.children}</ContentWrapper>
        {!disableSwipe && <SwipeCapture {...handlers} />}
        <CloseIconWrapper onClick={onClose}>
          <IconX size={28} className="text-black dark:text-white" />
        </CloseIconWrapper>
        {leftButton && <LeftIconWrapper>{leftButton}</LeftIconWrapper>}
      </StyledInteractiveModal>
    </>
  )
}

export default InteractiveModal
