import React from 'react'
import styled from 'styled-components'

interface Props {
  color?: string
  children: React.ReactNode
  disabled?: boolean
  onClick(): void
  tabIndex?: number
}

const StyledTextButton = styled.div<Props>`
  cursor: pointer;
  color: ${(props) => props.color || props.theme.navLinkActive};
  font-size: 14px;
  letter-spacing: 0.2px;

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

  ${(props) =>
    props.disabled === true &&
    `
    color: gray;
  `}
`

const TextButton = ({
  children,
  color,
  disabled = false,
  onClick,
  tabIndex
}: Props) => {
  return (
    <StyledTextButton
      color={color}
      disabled={disabled}
      onClick={disabled ? () => {} : onClick}
      tabIndex={tabIndex}
    >
      [ {children} ]
    </StyledTextButton>
  )
}

export default TextButton
