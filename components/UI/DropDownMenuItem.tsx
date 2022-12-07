import React from 'react'
import styled from 'styled-components'

interface Props {
  children: React.ReactNode
  onClick(): void
}

const StyledMenuItem = styled.li`
  cursor: pointer;
  padding: 4px 8px;
  width: 100%;

  &:hover {
    background-color: ${(props) => props.theme.navLinkActive};
    color: ${(props) => props.theme.body};
  }
`

const DropDownMenuItem = ({ children, onClick = () => {} }: Props) => {
  return <StyledMenuItem onClick={onClick}>{children}</StyledMenuItem>
}

export default DropDownMenuItem
