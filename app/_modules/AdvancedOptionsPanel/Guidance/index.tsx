import NumericInputSlider from '../NumericInputSlider'
import FlexRow from 'app/_components/FlexRow'
import { Button } from 'app/_components/Button'
import { IconSettings } from '@tabler/icons-react'
import { useState } from 'react'
import DropdownOptions from 'app/_modules/DropdownOptions'
import Checkbox from 'app/_components/Checkbox'
import Input from 'app/_components/Input'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import TextTooltipRow from 'app/_components/TextTooltipRow'
import TooltipComponent from 'app/_components/TooltipComponent'
import { useInput } from 'app/_modules/InputProvider/context'

interface GuidanceProps {
  hideOptions?: boolean
}

export default function Guidance({ hideOptions = false }: GuidanceProps) {
  const { input, setInput } = useInput()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <FlexRow gap={4} style={{ position: 'relative' }}>
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
                multiple guidance values. Example: 3,6,9,12,15
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
        {!hideOptions && (
          <Button onClick={() => setShowDropdown(true)}>
            <IconSettings stroke={1.5} />
          </Button>
        )}
      </div>
    </FlexRow>
  )
}
