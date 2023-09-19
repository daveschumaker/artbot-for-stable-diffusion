import React, { useRef } from 'react'
import styled from 'styled-components'
import { useOnClickOutside } from 'app/_hooks/useOnClickOutside'

interface DropdownContentProps {
  children?: React.ReactNode
  disabled?: boolean
  handleClose?: () => void
  open?: boolean
  onClick?: () => void
  ref?: any
  width?: string
}

const StyledDropdown = styled.div<DropdownContentProps>`
  background-color: gray;
  border-color: white;
  border-radius: 4px;
  border: 1px solid gray;
  margin: 4px 0 0 0;
  max-height: ${(props) => (props.open ? '100%' : '0')};
  opacity: ${(props) => (props.open ? '1' : '0')};
  overflow: hidden;
  position: absolute;
  transition: all 0.4s;
  z-index: 20;
`

export function DropdownContent(props: DropdownContentProps) {
  const { children, handleClose = () => {}, ...rest } = props
  const ref = useRef()
  useOnClickOutside(ref, () => {
    if (props.open) {
      handleClose()
    }
  })

  return (
    <StyledDropdown ref={ref} {...rest}>
      <ul>{children}</ul>
    </StyledDropdown>
  )
}
