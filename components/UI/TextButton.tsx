import React from 'react'
import styled from 'styled-components'

interface Props {
  color?: string
  children: React.ReactNode
  onClick(): void
}

const StyledTextButton = styled.div`
  cursor: pointer;
  color: ${(props) => props.color || props.theme.navLinkActive};
  font-size: 14px;

  // Disables hover effect for mobile devices:
  // https://stackoverflow.com/a/59210149
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      text-decoration: underline;
    }
  }

  &:active {
    transform: scale(0.98);
  }

  @media (min-width: 640px) {
    font-size: 16px;
  }
`

const TextButton = ({ children, color, onClick }: Props) => {
  return (
    <StyledTextButton color={color} onClick={onClick}>
      [ {children} ]
    </StyledTextButton>
  )
}

export default TextButton
