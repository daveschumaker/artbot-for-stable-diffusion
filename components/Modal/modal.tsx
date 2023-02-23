import React from 'react'
import styled from 'styled-components'
import CloseIcon from '../icons/CloseIcon'

interface ModalProps {
  children?: React.ReactNode | React.ReactNode[]
  handleClose(): void
  hideCloseButton?: boolean
}

const CloseIconWrapper = styled.div`
  cursor: pointer;
  position: absolute;
  top: 16px;
  right: 16px;
`

const Overlay = styled.div`
  background-color: white;
  opacity: 0.4;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 20;
`

const StyledModal = styled.div`
  background-color: ${(props) => props.theme.body};
  border: 1px solid ${(props) => props.theme.text};
  border-radius: 8px;
  opacity: 1;
  width: calc(100% - 32px);
  min-height: 200px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 16px;
  position: fixed;
  z-index: 20;

  @media (min-width: 640px) {
    width: 480px;
    min-height: 280px;
  }
`

const Modal = (props: ModalProps) => {
  return (
    <>
      <Overlay onClick={props.handleClose} />
      <StyledModal>
        {props.children}
        {!props.hideCloseButton && (
          <CloseIconWrapper onClick={props.handleClose}>
            <CloseIcon />
          </CloseIconWrapper>
        )}
      </StyledModal>
    </>
  )
}

export default Modal
