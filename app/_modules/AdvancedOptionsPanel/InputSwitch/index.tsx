import { ReactElement } from 'react'
import ReactSwitch from 'react-switch'
import { formatStringRemoveSpaces } from 'app/_utils/htmlUtils'
import Section from 'app/_components/Section'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import TextTooltipRow from 'app/_components/TextTooltipRow'
import TooltipComponent from 'app/_components/TooltipComponent'

interface Props {
  checked: boolean
  disabled?: boolean
  handleSwitchToggle: () => void
  label: string
  moreInfoLink?: ReactElement | null
  tooltip?: string
}

const InputSwitch = ({
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
      <SubSectionTitle>
        <>
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
        </>
      </SubSectionTitle>
      <ReactSwitch
        disabled={disabled}
        onChange={handleSwitchToggle}
        checked={checked ? true : false}
      />
    </Section>
  )
}

export default InputSwitch
