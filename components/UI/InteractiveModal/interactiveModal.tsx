import { useEffect } from 'react'
import styled from 'styled-components'

import CloseIcon from '../../icons/CloseIcon'
import Overlay from '../Overlay'
import { useScrollLock } from '../../../hooks/useScrollLock'

const CloseIconWrapper = styled.div`
  cursor: pointer;
  position: absolute;
  top: 8px;
  right: 8px;
`

const StyledInteractiveModal = styled.div`
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
    max-width: 752px;
    /* min-height: 480px; */
    height: 640px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  @media (min-width: 1280px) {
    max-width: 1008px;
  }
`

const InteractiveModal = (props: any) => {
  const { lockScroll, unlockScroll } = useScrollLock()

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

  return (
    <>
      <Overlay handleClose={props?.handleClose} />
      <StyledInteractiveModal>
        {props.children}
        <CloseIconWrapper onClick={props?.handleClose}>
          <CloseIcon size={28} />
        </CloseIconWrapper>
      </StyledInteractiveModal>
    </>
  )
}

export default InteractiveModal
