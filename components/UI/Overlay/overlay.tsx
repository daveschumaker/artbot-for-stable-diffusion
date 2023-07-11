import styled from 'styled-components'

export interface IOverlayProps {
  disableBackground?: boolean
  handleClose?: () => void
  zIndex?: number
}

const StyledOverlay = styled.div<IOverlayProps>`
  opacity: 0.8;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
`

const Overlay = (props: IOverlayProps) => {
  const {
    disableBackground = false,
    handleClose = () => {},
    zIndex = 30
  } = props
  return (
    <StyledOverlay
      className="StyledOverlay"
      onClick={handleClose}
      style={{
        backgroundColor: disableBackground
          ? 'unset'
          : 'var(--overlay-background)',
        zIndex
      }}
    />
  )
}

export default Overlay
