import React from 'react'
import styled from 'styled-components'

interface MenuButtonProps {
  active?: boolean
  children: React.ReactNode
  title: string
  onClick(): void
}

const StyledMenuButton = styled.button<MenuButtonProps>`
  background-color: ${(props) => props.theme.body};
  border: 2px solid ${(props) => props.theme.navLinkActive};
  border-radius: 4px;
  color: ${(props) => props.theme.navLinkActive};
  cursor: pointer;
  padding: 2px;
  position: relative;

  &:active {
    transform: scale(0.96);
  }

  // Disables hover effect for mobile devices:
  // https://stackoverflow.com/a/59210149
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: ${(props) => props.theme.navLinkActive};
      color: ${(props) => props.theme.body};
    }
  }

  ${(props) =>
    props.active &&
    `
      background-color: ${props.theme.navLinkActive};
      color: ${props.theme.body};
  `}
`

const MenuButton = ({ active, children, onClick, title }: MenuButtonProps) => {
  return (
    <StyledMenuButton active={active} onClick={onClick} title={title}>
      {children}
    </StyledMenuButton>
  )
}

export default MenuButton
