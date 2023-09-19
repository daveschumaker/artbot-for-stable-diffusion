import React from 'react'
import styled from 'styled-components'

interface DropdownItemContentProps {
  active?: boolean
  children?: React.ReactNode
  disabled?: boolean
  open?: boolean
  onClick?: () => void
  width?: string
}

const StyledDropdownItem = styled.li<DropdownItemContentProps>`
  cursor: pointer;
  font-weight: 300;
  font-size: 14px;
  padding: 4px 8px;

  &:active {
    transform: scale(0.98);
  }

  ${(props) =>
    !props.active &&
    `
      &:hover {
        background-color: #737373;
      }
  `}

  ${(props) =>
    props.active &&
    `
    background-color: #7b3c76;
  `}
`

export function DropdownItem(props: DropdownItemContentProps) {
  const { children, ...rest } = props
  return <StyledDropdownItem {...rest}>{children}</StyledDropdownItem>
}
