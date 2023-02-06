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
  margin-top: 48px;
  margin-left: 12px;
  margin-right: 12px;
  margin-bottom: 80px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 100vh;
  padding-top: 8px;
  padding-bottom: ${(props) => (props.isPwa ? '100px' : 0)};
  position: relative;
  /* width: 100%; */

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
// className="pb-[68px] md:pb-2 px-4 md:px-2"
export default function ContentWrapper(props: ContentWrapperProps) {
  const [isPwa, setIsPwa] = useState(false)

  useEffect(() => {
    setIsPwa(isInstalledPwa())
  }, [])

  return <StyledContent isPwa={isPwa}>{props.children}</StyledContent>
}
