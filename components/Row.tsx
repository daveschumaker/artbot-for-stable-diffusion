import React from 'react'
import styled from 'styled-components'

interface IRowProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

const StyledRow = styled.div`
  align-items: center;
  column-gap: 8px;
  display: flex;
  flex-direction: row;
  width: 100%;
`

const Row = (props: IRowProps) => {
  const { children, ...rest } = props
  return <StyledRow {...rest}>{children}</StyledRow>
}

export default Row
