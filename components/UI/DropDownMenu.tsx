import React from 'react'
import styled from 'styled-components'

interface Props {
  children: React.ReactNode
}

const StyledDropDownMenu = styled.div`
  background-color: ${(props) => props.theme.body};
  border: 2px solid ${(props) => props.theme.navLinkActive};
  border-radius: 4px;
  /* padding: 8px; */
  position: absolute;
  top: 0;
  width: 200px;
  right: -2px;
  top: 36px;
  z-index: 10;
`
const DropDownMenu = ({ children }: Props) => {
  return (
    <StyledDropDownMenu>
      <ul>{children}</ul>
    </StyledDropDownMenu>
  )
}

export default DropDownMenu
