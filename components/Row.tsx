import React from 'react'
import styled from 'styled-components'

interface IRowProps {
  children: React.ReactNode
  onClick?: () => void
}

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  column-gap: 8px;
`

const Row = (props: IRowProps) => {
  const { children, ...rest } = props
  return <StyledRow {...rest}>{children}</StyledRow>
}

export default Row
