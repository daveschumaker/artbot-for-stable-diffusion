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

  &:hover {
    text-decoration: underline;
  }

  &:active {
    transform: scale(0.98);
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
