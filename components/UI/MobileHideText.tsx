import React from 'react'
import styled from 'styled-components'

const HideTextWrapper = styled.span`
  display: none;
  @media (min-width: 718px) {
    display: inline-block;
  }
`
interface Props {
  children: React.ReactNode
}

const MobileHideText = (props: Props) => {
  return <HideTextWrapper>{props.children}</HideTextWrapper>
}

export default MobileHideText
