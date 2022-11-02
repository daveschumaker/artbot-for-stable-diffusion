import React from 'react'
import styled from 'styled-components'

interface InputProps {
  name?: string
  type?: string
  className?: string
  children?: React.ReactNode
  error?: boolean
  onBlur?: any
  onChange: any
  width?: string
  value: string
}

const StyledInput = styled.input<InputProps>`
  background-color: ${(props) => props.theme.inputBackground};
  border-radius: 4px;
  border: 1px solid ${(props) => props.theme.inputColor};
  color: ${(props) => props.theme.inputColor};
  font-size: 16px;
  height: 40px;
  padding: 8px;
  width: ${(props) => (props.width ? props.width : '100%')};

  ${(props) => props.error && `border: 1px solid red;`}
`

const Input = (props: InputProps) => {
  const { children, ...rest } = props
  return <StyledInput {...rest}>{children}</StyledInput>
}

export default Input
