import { useEffect } from 'react'
import PromptInputSettings from '../../../../models/PromptInputSettings'
import NumberInput from '../../../UI/NumberInput'
import Section from '../../../UI/Section'
import Slider from '../../../UI/Slider'
import SubSectionTitle from '../../../UI/SubSectionTitle'
import TextTooltipRow from '../../../UI/TextTooltipRow'
import Tooltip from '../../../UI/Tooltip'

const ClipSkip = ({
  input,
  setInput,
  handleChangeInput,
  handleNumberInput
}: {
  input: any
  setInput: any
  handleChangeInput(event: object): void
  handleNumberInput(obj: object): void
}) => {
  useEffect(() => {
    if (
      input.clipskip !== '' &&
      (typeof input.clipskip === 'undefined' || isNaN(input.clipskip))
    ) {
      setInput({ clipskip: 1 })
    }
  }, [input, setInput])

  return (
    <Section>
      <div className="flex flex-row items-center justify-between">
        <SubSectionTitle>
          <TextTooltipRow>
            CLIP skip
            <Tooltip left="-20" width="240px">
              Determine how early to stop processing a prompt using CLIP. Higher
              values stop processing earlier. Default is 1 (no skip).
            </Tooltip>
          </TextTooltipRow>
          <div className="block text-xs w-full">(1 - 12)</div>
        </SubSectionTitle>
        <NumberInput
          // @ts-ignore
          className="mb-2"
          type="text"
          min={1}
          max={12}
          name="clipskip"
          onMinusClick={() => {
            const value = input.clipskip - 1
            PromptInputSettings.set('clipskip', value)
            setInput({ clipskip: value })
          }}
          onPlusClick={() => {
            const value = input.clipskip + 1
            PromptInputSettings.set('clipskip', value)
            setInput({ clipskip: value })
          }}
          onChange={handleNumberInput}
          onBlur={(e: any) => {
            if (
              isNaN(e.target.value) ||
              e.target.value < 1 ||
              e.target.value > 12
            ) {
              setInput({ clipskip: 1 })
            }
          }}
          // @ts-ignore
          value={input.clipskip}
          width="100%"
        />
      </div>
      <div className="mb-4">
        <Slider
          value={input.clipskip}
          min={1}
          max={12}
          onChange={(e: any) => {
            const event = {
              target: {
                name: 'clipskip',
                value: Number(e.target.value)
              }
            }

            handleChangeInput(event)
          }}
        />
      </div>
    </Section>
  )
}

export default ClipSkip
