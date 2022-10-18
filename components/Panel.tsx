import React from 'react'
import styled from 'styled-components'

interface PanelProps {
  children?: React.ReactNode
  className?: string
  open?: boolean
}

const StyledPanel = styled.div<PanelProps>`
  border: solid 1px white;
  border-radius: 4px;
  padding: 8px 16px;
  width: 100%;
`

const Panel = (props: PanelProps) => {
  const { children, ...rest } = props
  return <StyledPanel {...rest}>{children}</StyledPanel>
}

export default Panel
