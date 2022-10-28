import React from 'react'
import styled from 'styled-components'

interface ButtonProps {
  children?: React.ReactNode
  disabled?: boolean
  onClick?: () => void
  btnType?: string
  title?: string
  width?: string
  style?: any
}

const StyledButton = styled.button<ButtonProps>`
  align-items: center;
  background-color: ${(props) => props.theme.buttonPrimary};
  border-radius: 4px;
  border: 1px solid white;
  color: white;
  display: flex;
  font-size: 14px;
  font-weight: 600;
  gap: 4px;
  justify-content: center;
  height: 40px;
  min-width: 40px;
  padding: 2px 8px;
  width: ${(props) => props.width};

  ${(props) =>
    props.btnType === 'secondary' &&
    `
    color: white;
    background-color: ${props.theme.buttonSecondary};

    &:hover {
      background-color: ${props.theme.buttonSecondaryActive};
    }
  `}

  ${(props) =>
    !props.disabled &&
    props.btnType !== 'secondary' &&
    `
    &:hover {
      background-color: ${props.theme.buttonPrimaryActive};
    }
  `}

  &:active {
    transform: scale(0.98);
  }

  ${(props) =>
    props.disabled &&
    `
    background-color: gray;
  `}
`

export function Button(props: ButtonProps) {
  const { children, ...rest } = props
  return <StyledButton {...rest}>{children}</StyledButton>
}
