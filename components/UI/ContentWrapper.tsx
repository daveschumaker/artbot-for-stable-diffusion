import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { isInstalledPwa } from '../../utils/appUtils'
interface ContentWrapperProps {
  children: React.ReactNode
}

interface StyleProps {
  isPwa?: boolean
}

const StyledContent = styled.div<StyleProps>`
  background-color: ${(props) => props.theme.body};
  margin-left: 12px;
  margin-right: 12px;
  margin-bottom: 80px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 100vh;
  padding-top: 8px;
  padding-bottom: ${(props) => (props.isPwa ? '120px' : 0)};
  position: relative;

  @media (min-width: 640px) {
    margin: auto auto 0 auto;
    max-width: 768px;
    padding-bottom: 0;
    width: calc(100% - 32px);
  }

  @media (min-width: 1280px) {
    margin: auto auto 0 auto;
    max-width: 1024px;
  }
`
export default function ContentWrapper(props: ContentWrapperProps) {
  const [isPwa, setIsPwa] = useState(false)

  useEffect(() => {
    setIsPwa(isInstalledPwa())
  }, [])

  return <StyledContent isPwa={isPwa}>{props.children}</StyledContent>
}
