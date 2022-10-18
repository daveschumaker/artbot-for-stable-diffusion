import React from 'react'
import styled from 'styled-components'
interface ContentWrapperProps {
  children: React.ReactNode
}

const StyledContent = styled.div`
  margin: auto 24px 0 24px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  max-width: 768px;
  min-height: 100vh;
  padding-top: 8px;
  position: relative;
`
// className="pb-[68px] md:pb-2 px-4 md:px-2"
export default function ContentWrapper(props: ContentWrapperProps) {
  return <StyledContent>{props.children}</StyledContent>
}
