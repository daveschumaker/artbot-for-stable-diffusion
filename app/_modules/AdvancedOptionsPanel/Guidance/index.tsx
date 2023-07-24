import { GetSetPromptInput } from 'types'
import NumericInputSlider from '../NumericInputSlider'
import FlexRow from 'app/_components/FlexRow'
import { Button } from 'components/UI/Button'
import { IconSettings } from '@tabler/icons-react'
import { useState } from 'react'
import DropdownOptions from 'app/_modules/DropdownOptions'
import Checkbox from 'components/UI/Checkbox'
import Input from 'components/UI/Input'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import TextTooltipRow from 'app/_components/TextTooltipRow'
import TooltipComponent from 'app/_components/TooltipComponent'

export default function Guidance({ input, setInput }: GetSetPromptInput) {
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <FlexRow style={{ columnGap: '4px', position: 'relative' }}>
      {input.useMultiGuidance && (
        <div className="mb-4 w-full">
          <SubSectionTitle>
            <TextTooltipRow>
              Guidance
              <span
                className="text-xs w-full font-[400]"
                style={{ paddingRight: '4px', width: 'auto' }}
              >
                &nbsp;(1 - 30)
              </span>
              <TooltipComponent tooltipId="multi-guidance">
                Comma separated values to create a series of images using
                multiple steps. Example: 3,6,9,12,15
              </TooltipComponent>
            </TextTooltipRow>
          </SubSectionTitle>
          <Input
            // @ts-ignore
            type="text"
            name="multiGuidance"
            onChange={(e: any) => {
              setInput({ multiGuidance: e.target.value })
            }}
            placeholder="3,5,7,9"
            // @ts-ignore
            value={input.multiGuidance}
            width="100%"
          />
        </div>
      )}
      {!input.useMultiGuidance && (
        <NumericInputSlider
          label="Guidance"
          tooltip="Higher numbers follow the prompt more closely. Lower
      numbers give more creativity."
          from={1}
          to={30}
          step={0.5}
          input={input}
          setInput={setInput}
          fieldName="cfg_scale"
          fullWidth
        />
      )}
      <div>
        <div
          className="label_padding"
          style={{ height: '16px', width: '1px' }}
        />
        {showDropdown && (
          <DropdownOptions
            handleClose={() => setShowDropdown(false)}
            title="Guidance options"
            top="80px"
          >
            <div style={{ padding: '8px 0' }}>
              <Checkbox
                label="Use multi guidance?"
                checked={input.useMultiGuidance}
                onChange={(bool: boolean) => {
                  setInput({ useMultiGuidance: bool })
                }}
              />
            </div>
          </DropdownOptions>
        )}
        <Button onClick={() => setShowDropdown(true)}>
          <IconSettings />
        </Button>
      </div>
    </FlexRow>
  )
}
