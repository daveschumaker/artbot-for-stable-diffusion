import { useCallback } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'

import { trackEvent } from 'app/_api/telemetry'
import { Button } from 'app/_components/Button'
import { IconBrush, IconTool } from '@tabler/icons-react'

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
  const router = useRouter()
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

  const handlePaintClick = () => {
    trackEvent({
      event: 'NEW_PAINT_CLICK',
      context: 'createPage'
    })
    router.push('/paint')
  }

  return (
    <div className="w-1/2 flex flex-row gap-2">
      <Button title="Make a painting" onClick={handlePaintClick}>
        <IconBrush />
      </Button>
      <Button title="Show advanced options" onClick={handleShowAdvancedOptions}>
        <IconTool />
        <MobileHideText>Advanced options</MobileHideText>
      </Button>
    </div>
  )
}
