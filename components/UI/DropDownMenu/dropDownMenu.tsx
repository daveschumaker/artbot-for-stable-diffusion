import React, { ReactElement } from 'react'
import styled from 'styled-components'
import { IDropDownMenuItem } from '../DropDownMenuItem/dropDownMenuItem'
import Overlay from '../Overlay'

interface Props {
  children: Array<any>
  handleClose: () => void
}

const StyledDropDownMenu = styled.div`
  background-color: ${(props) => props.theme.body};
  border: 2px solid ${(props) => props.theme.navLinkActive};
  border-radius: 4px;
  /* padding: 4px 0; */
  position: absolute;
  top: 0;
  width: 200px;
  right: -2px;
  top: 36px;
  z-index: 20;
`
const DropDownMenu = ({ children, handleClose = () => {} }: Props) => {
  return (
    <>
      <Overlay disableBackground handleClose={handleClose} />
      <StyledDropDownMenu>
        <ul>
          {React.Children.map(
            children,
            (child: ReactElement<IDropDownMenuItem>) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, { handleClose })
              }

              return child
            }
          )}
        </ul>
      </StyledDropDownMenu>
    </>
  )
}

export default DropDownMenu
