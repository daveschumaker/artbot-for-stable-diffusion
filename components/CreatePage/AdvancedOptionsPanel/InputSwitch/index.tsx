import ReactSwitch from 'react-switch'
import Section from '../../../UI/Section'
import SubSectionTitle from '../../../UI/SubSectionTitle'
import TextTooltipRow from '../../../UI/TextTooltipRow'
import Tooltip from '../../../UI/Tooltip'

interface Props {
  checked: boolean
  disabled?: boolean
  handleSwitchToggle: () => void
  label: string
  tooltip?: string
}

const InputSwitch = ({
  checked = false,
  disabled = false,
  handleSwitchToggle = () => {},
  label,
  tooltip
}: Props) => {
  return (
    <Section>
      <SubSectionTitle>
        <TextTooltipRow>
          {label}
          {tooltip && (
            <Tooltip left="-140" width="240px">
              {tooltip}
            </Tooltip>
          )}
        </TextTooltipRow>
      </SubSectionTitle>
      <ReactSwitch
        disabled={disabled}
        onChange={handleSwitchToggle}
        checked={Boolean(checked)}
      />
    </Section>
  )
}

export default InputSwitch
