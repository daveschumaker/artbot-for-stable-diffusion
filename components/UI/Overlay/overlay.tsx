import styled from 'styled-components'

export interface IOverlayProps {
  disableBackground?: boolean
  handleClose?: () => void
}

const StyledOverlay = styled.div<IOverlayProps>`
  background-color: ${(props: any) => props.theme.overlayBackground};
  opacity: 0.8;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 30;

  ${(props) =>
    props.disableBackground &&
    `
    background-color: unset;
    `}
`

const Overlay = (props: IOverlayProps) => {
  const { disableBackground = false, handleClose = () => {} } = props
  return (
    <StyledOverlay
      className="StyledOverlay"
      disableBackground={disableBackground}
      onClick={handleClose}
    />
  )
}

export default Overlay
