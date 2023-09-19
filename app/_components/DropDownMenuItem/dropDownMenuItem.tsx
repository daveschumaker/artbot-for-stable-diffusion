import React from 'react'
import styled from 'styled-components'

export interface IDropDownMenuItem {
  children: React.ReactNode
  onClick(): void
  handleClose?: () => void
}

const StyledMenuItem = styled.li`
  cursor: pointer;
  font-size: 14px;
  padding: 6px 16px;
  width: 100%;

  &:hover {
    background-color: ${(props) => props.theme.navLinkActive};
    color: ${(props) => props.theme.body};
  }
`

const DropDownMenuItem = ({
  children,
  onClick = () => {},
  handleClose = () => {}
}: IDropDownMenuItem) => {
  const handleOnClick = () => {
    handleClose()
    onClick()
  }

  return <StyledMenuItem onClick={handleOnClick}>{children}</StyledMenuItem>
}

export default DropDownMenuItem
