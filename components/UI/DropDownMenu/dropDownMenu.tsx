import React, { ReactElement, useEffect } from 'react'
import styled from 'styled-components'
import { IDropDownMenuItem } from '../DropDownMenuItem/dropDownMenuItem'
import Overlay from '../Overlay'

interface Props {
  children: any
  handleClose: () => void
  position?: string
}

interface StyleProps {
  position?: string
}

const StyledDropDownMenu = styled.div<StyleProps>`
  background-color: ${(props) => props.theme.body};
  border: 2px solid ${(props) => props.theme.navLinkActive};
  border-radius: 4px;
  /* padding: 4px 0; */
  position: absolute;
  top: 0;
  width: 240px;
  right: -2px;
  top: 36px;
  z-index: 20;

  ${(props) => {
    if (props.position === 'left') {
      return `left: 0;`
    } else {
      return 'right: -2px;'
    }
  }}
`
const DropDownMenu = ({
  children,
  handleClose = () => { },
  position = ''
}: Props) => {
  const keyDownHandler = (event: any) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      handleClose()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', keyDownHandler)

    return () => {
      document.removeEventListener('keydown', keyDownHandler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Overlay disableBackground handleClose={handleClose} />
      <StyledDropDownMenu position={position}>
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
