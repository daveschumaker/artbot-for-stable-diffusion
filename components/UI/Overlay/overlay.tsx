import styled from 'styled-components'

export interface IOverlayProps {
  disableBackground?: boolean
  handleClose?: () => void
}

const StyledOverlay = styled.div<IOverlayProps>`
  ${(props) =>
    !props.disableBackground &&
    `
    background-color: white;
    `}
  opacity: 0.4;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 20;
`

const Overlay = (props: IOverlayProps) => {
  const { disableBackground = false, handleClose = () => {} } = props
  return (
    <StyledOverlay
      disableBackground={disableBackground}
      onClick={handleClose}
    />
  )
}

export default Overlay
