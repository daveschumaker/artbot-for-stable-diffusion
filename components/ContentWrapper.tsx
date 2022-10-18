import React from 'react'
import styled from 'styled-components'
interface ContentWrapperProps {
  children: React.ReactNode
}

const StyledContent = styled.div`
  margin-top: auto;
  margin-left: 24px;
  margin-right: 24px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 100vh;
  padding-top: 8px;
  position: relative;
  /* width: 100%; */

  @media (min-width: 640px) {
    margin: auto auto 0 auto;
    max-width: 768px;
    width: calc(100% - 32px);
  }

  @media (min-width: 1280px) {
    margin: auto auto 0 auto;
    max-width: 1024px;
  }
`
// className="pb-[68px] md:pb-2 px-4 md:px-2"
export default function ContentWrapper(props: ContentWrapperProps) {
  return <StyledContent>{props.children}</StyledContent>
}
