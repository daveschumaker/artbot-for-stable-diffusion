import React from 'react'
import styled from 'styled-components'

interface TextProps {
  children?: React.ReactNode
}

const StyledText = styled.div`
  font-size: 18px;
  line-height: 28px;
  margin-bottom: 20px;
`

const Text = (props: TextProps) => {
  return <StyledText>{props.children}</StyledText>
}

export default Text
