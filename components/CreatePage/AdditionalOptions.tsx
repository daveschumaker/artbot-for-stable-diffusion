import { useCallback } from 'react'
import styled from 'styled-components'

import { trackEvent } from '../../api/telemetry'
import { Button } from '../Button'
import ToolIcon from '../icons/ToolIcon'

interface AdvancedOptionsProps {
  showAdvanced: boolean
  setShowAdvanced: any
}

const MobileHideText = styled.span`
  display: none;
  @media (min-width: 640px) {
    display: inline-block;
  }
`

export function AdvancedOptions({
  showAdvanced,
  setShowAdvanced
}: AdvancedOptionsProps) {
  const handleShowAdvancedOptions = useCallback(() => {
    if (showAdvanced) {
      setShowAdvanced(false)
    } else {
      trackEvent({
        event: 'ADVANCED_OPTIONS_CLICK',
        context: `createPage`
      })
      setShowAdvanced(true)
    }
  }, [setShowAdvanced, showAdvanced])

  return (
    <div className="w-1/2 flex flex-row gap-2">
      <Button title="Show advanced options" onClick={handleShowAdvancedOptions}>
        <ToolIcon />
        <MobileHideText>Advanced options</MobileHideText>
      </Button>
    </div>
  )
}
