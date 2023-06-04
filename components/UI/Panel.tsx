import React from 'react'
import styled from 'styled-components'

interface PanelProps {
  children?: React.ReactNode
  className?: string
  open?: boolean
  padding?: string
}

const StyledPanel = styled.div<PanelProps>`
  border: solid 2px ${(props) => props.theme.border};
  border-radius: 4px;
  padding: ${(props) => props.padding || '8px'};
  width: 100%;
  overflow-x: hidden;

  @media (min-width: 640px) {
    padding: ${(props) => props.padding || '16px'};
  }
`

const Panel = (props: PanelProps) => {
  const { children, padding, ...rest } = props
  return (
    <StyledPanel padding={padding} {...rest}>
      {children}
    </StyledPanel>
  )
}

export default Panel
