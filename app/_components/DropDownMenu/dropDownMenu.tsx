import React, { ReactElement, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useOnClickOutside } from 'app/_hooks/useOnClickOutside'
import { IDropDownMenuItem } from '../DropDownMenuItem/dropDownMenuItem'

interface Props {
  children: any
  handleClose: () => void
  position?: string
}

interface StyleProps {
  position?: string
  ref?: any
}

const StyledDropDownMenu = styled.div<StyleProps>`
  background-color: var(--body-color);
  border: 2px solid ${(props) => props.theme.navLinkActive};
  border-radius: 4px;
  /* padding: 4px 0; */
  position: absolute;
  top: 0;
  width: 240px;
  right: -2px;
  top: 36px;
  z-index: 15;

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
  handleClose = () => {},
  position = ''
}: Props) => {
  const ref = useRef()
  useOnClickOutside(ref, () => {
    setTimeout(() => {
      handleClose()
    }, 200)
  })

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
      <StyledDropDownMenu position={position} ref={ref}>
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
