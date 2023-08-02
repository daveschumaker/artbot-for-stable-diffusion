import styled from 'styled-components'

export interface IOverlayProps {
  disableBackground?: boolean
  handleClose?: () => void
  zIndex?: number
}

const StyledOverlay = styled.div<IOverlayProps>`
  background-color: black;
  bottom: 0;
  left: 0;
  opacity: 0.8;
  position: fixed;
  right: 0;
  top: 0;
`

const Overlay = (props: IOverlayProps) => {
  const {
    disableBackground = false,
    handleClose = () => {},
    zIndex = 'var(--zIndex-navBar)'
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
