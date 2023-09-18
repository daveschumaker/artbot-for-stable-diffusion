import { GetSetPromptInput } from 'types'
import NumericInputSlider from '../NumericInputSlider'
import FlexRow from 'app/_components/FlexRow'
import { Button } from 'app/_components/Button'
import { IconSettings } from '@tabler/icons-react'
import { useState } from 'react'
import DropdownOptions from 'app/_modules/DropdownOptions'
import Checkbox from 'app/_components/Checkbox'
import Input from 'components/UI/Input'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import TextTooltipRow from 'app/_components/TextTooltipRow'
import TooltipComponent from 'app/_components/TooltipComponent'

interface DenoiseOptions extends GetSetPromptInput {
  hideOptions?: boolean
}

export default function Denoise({
  hideOptions = false,
  input,
  setInput
}: DenoiseOptions) {
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <FlexRow gap={4} style={{ position: 'relative' }}>
      {input.useMultiDenoise && (
        <div className="mb-4 w-full">
          <SubSectionTitle>
            <TextTooltipRow>
              Denoise
              <span
                className="text-xs w-full font-[400]"
                style={{ paddingRight: '4px', width: 'auto' }}
              >
                &nbsp;(0 - 1)
              </span>
              <TooltipComponent tooltipId="multi-denoise-tooltip">
                Comma separated values to create a series of images using
                multiple denoise settings. Example: 0.2, 0.25, 0.3
              </TooltipComponent>
            </TextTooltipRow>
          </SubSectionTitle>
          <Input
            // @ts-ignore
            type="text"
            name="multiDenoise"
            onChange={(e: any) => {
              setInput({ multiDenoise: e.target.value })
            }}
            placeholder="0.2, 0.25, 0.3"
            // @ts-ignore
            value={input.multiDenoise}
            width="100%"
          />
        </div>
      )}
      {!input.useMultiDenoise && (
        <NumericInputSlider
          label="Denoise"
          tooltip="Amount of noise added to input image. Values that
                  approach 1.0 allow for lots of variations but will
                  also produce images that are not semantically
                  consistent with the input. Only available for img2img."
          from={0.0}
          to={1.0}
          step={0.05}
          input={input}
          setInput={setInput}
          fieldName="denoising_strength"
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
            title="Denoise options"
            top="80px"
          >
            <div style={{ padding: '8px 0' }}>
              <Checkbox
                label="Use multi denoise?"
                checked={input.useMultiDenoise}
                onChange={(bool: boolean) => {
                  setInput({ useMultiDenoise: bool })
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
