import styled from 'styled-components'

const FullPageDiv = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
`

interface Props {
  handleClick(): void
}

const CaptureClickOverlay = ({ handleClick }: Props) => {
  return <FullPageDiv onClick={handleClick} />
}

export default CaptureClickOverlay
