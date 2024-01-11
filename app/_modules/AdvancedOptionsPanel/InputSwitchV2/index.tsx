import React, { ReactElement, useEffect, useState } from 'react'
import Section from 'app/_components/Section'
import TextTooltipRow from 'app/_components/TextTooltipRow'
import TooltipComponent from 'app/_components/TooltipComponent'
import FlexRow from 'app/_components/FlexRow'
import { generateRandomString } from 'app/_utils/appUtils'
import Switch from 'app/_components/Switch'

interface Props {
  checked: boolean
  disabled?: boolean
  handleSwitchToggle: () => void
  label: string | React.ReactNode
  moreInfoLink?: ReactElement | null
  tooltip?: string
}

const InputSwitchV2 = ({
  checked = false,
  disabled = false,
  handleSwitchToggle = () => {},
  label,
  moreInfoLink = null,
  tooltip
}: Props) => {
  const [tooltipId, setTooltipId] = useState<string | null>(null)

  useEffect(() => {
    setTooltipId(generateRandomString())
  }, [label])

  return (
    <Section>
      <FlexRow gap={8}>
        <Switch
          checked={checked ? true : false}
          disabled={disabled}
          onChange={handleSwitchToggle}
        />
        <div style={{ fontSize: '12px' }}>
          <TextTooltipRow>
            {label}
            {tooltip && tooltipId && (
              <TooltipComponent tooltipId={tooltipId}>
                {tooltip}
              </TooltipComponent>
            )}
          </TextTooltipRow>
          {moreInfoLink && (
            <div className="mt-1 mb-2 text-xs">{moreInfoLink}</div>
          )}
        </div>
      </FlexRow>
    </Section>
  )
}

export default InputSwitchV2
