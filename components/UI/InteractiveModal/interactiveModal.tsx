import { lock, unlock } from 'tua-body-scroll-lock'
import { createRef, useEffect } from 'react'
import styled from 'styled-components'

import CloseIcon from '../../icons/CloseIcon'
import Overlay from '../Overlay'

interface IProps {
  ref: any
}

const CloseIconWrapper = styled.div`
  cursor: pointer;
  position: absolute;
  top: 8px;
  right: 8px;
`

const StyledInteractiveModal = styled.div<IProps>`
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
    width: 480px;
    min-height: 320px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
`

const InteractiveModal = (props: any) => {
  const ref = createRef()

  useEffect(() => {
    lock()

    // @ts-ignore
    unlock(ref)

    return () => unlock()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Overlay handleClose={props.handleClose} />
      <StyledInteractiveModal ref={ref}>
        {props.children}
        <CloseIconWrapper onClick={props.handleClose}>
          <CloseIcon size={28} />
        </CloseIconWrapper>
      </StyledInteractiveModal>
    </>
  )
}

export default InteractiveModal
