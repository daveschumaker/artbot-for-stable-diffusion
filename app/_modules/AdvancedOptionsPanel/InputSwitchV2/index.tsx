import { ReactElement } from 'react'
import ReactSwitch from 'react-switch'
import { formatStringRemoveSpaces } from '../../../../utils/htmlUtils'
import Section from 'app/_components/Section'
import TextTooltipRow from 'app/_components/TextTooltipRow'
import TooltipComponent from 'app/_components/TooltipComponent'
import FlexRow from 'app/_components/FlexRow'

interface Props {
  checked: boolean
  disabled?: boolean
  handleSwitchToggle: () => void
  label: string
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
  const tooltipId = formatStringRemoveSpaces(label)

  return (
    <Section>
      <FlexRow style={{ columnGap: '8px' }}>
        <ReactSwitch
          disabled={disabled}
          onChange={handleSwitchToggle}
          checked={checked ? true : false}
        />
        <div style={{ fontSize: '14px' }}>
          <TextTooltipRow>
            {label}
            {tooltip && (
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
