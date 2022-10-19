import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import InfoIcon from './icons/InfoIcon'

interface TooltipProps {
  children?: React.ReactNode
  width?: string
}

const StyledInfoTip = styled.span`
  cursor: pointer;
  display: inline-block;
  padding-left: 8px;
  position: relative;
  top: 6px;
  /* z-index: 0; */
`

const StyledPopup = styled.div<TooltipProps>`
  background-color: black;
  border: 1px solid white;
  border-radius: 8px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  color: white;
  font-size: 12px;
  min-height: 50px;
  min-width: 100px;
  padding: 12px;
  position: absolute;
  top: 28px;
  width: ${(props) => (props.width ? props.width : '120px')};
  z-index: 10;
`

export default function Tooltip({ children, width }: TooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const handleShowToolip = useCallback(() => {
    setShowTooltip(!showTooltip)
  }, [showTooltip])

  return (
    <StyledInfoTip
      onClick={handleShowToolip}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <InfoIcon stroke="white" fill="#14B8A6" />
      {showTooltip && <StyledPopup width={width}>{children}</StyledPopup>}
    </StyledInfoTip>
  )
}
