import React from 'react'
import styled from 'styled-components'

interface PanelProps {
  children?: React.ReactNode
  className?: string
  open?: boolean
}

const StyledPanel = styled.div<PanelProps>`
  border: solid 2px ${(props) => props.theme.border};
  border-radius: 4px;
  padding: 8px;
  width: 100%;

  @media (min-width: 640px) {
    padding: 16px;
  }
`

const Panel = (props: PanelProps) => {
  const { children, ...rest } = props
  return <StyledPanel {...rest}>{children}</StyledPanel>
}

export default Panel
