import { ReactNode, useEffect } from 'react'
import SlidingPane from 'react-sliding-pane'
import 'react-sliding-pane/dist/react-sliding-pane.css'
import styled from 'styled-components'

interface Props {
  children: ReactNode
  className?: string
  handleClosePane(): void
  open: boolean
  overlayClassName?: string
}

const StyledSlidingPanel = styled(SlidingPane)`
  background-color: var(--body-color);
  border-top: 1px solid var(--text-color);
  margin-bottom: 100px;
  max-width: 768px;
  width: 100%;
  z-index: 32;

  @media (min-width: 768px) {
    border: 1px solid var(--text-color);
    border-radius: 4px;
    border-bottom: none;
  }
`

const SlidingPanel = ({
  className,
  children,
  handleClosePane,
  open,
  overlayClassName
}: Props) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <StyledSlidingPanel
      className={className}
      hideHeader
      isOpen={open}
      overlayClassName={overlayClassName}
      from="bottom"
      onRequestClose={handleClosePane}
      width="100%"
    >
      {children}
    </StyledSlidingPanel>
  )
}

export default SlidingPanel
