import FlexRow from 'app/_components/FlexRow'
import { Button } from 'app/_components/Button'
import { IconSettings } from '@tabler/icons-react'
import { useState } from 'react'
import DropdownOptions from 'app/_modules/DropdownOptions'
import Checkbox from 'app/_components/Checkbox'
import Input from 'app/_components/Input'
import TooltipComponent from 'app/_components/TooltipComponent'
import { useInput } from 'app/_modules/InputProvider/context'
import Slider from 'app/_components/Slider'
import styles from './denoise.module.css'
import NumberInput from 'app/_components/NumberInput'
import OptionsRow from 'app/_modules/AdvancedOptionsPanelV2/OptionsRow'
import OptionsRowLabel from 'app/_modules/AdvancedOptionsPanelV2/OptionsRowLabel'
interface DenoiseOptions {
  hideOptions?: boolean
}

export default function Denoise({ hideOptions = false }: DenoiseOptions) {
  const { input, setInput } = useInput()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <OptionsRow
      style={{
        position: 'relative'
      }}
    >
      <OptionsRowLabel>
        Denoise
        <TooltipComponent tooltipId="multi-denoise-tooltip">
          {input.useMultiDenoise && (
            <div>
              Comma separated values to create a series of images using multiple
              denoise settings. Example: 0.2, 0.25, 0.3
            </div>
          )}
          {!input.useMultiDenoise && (
            <div>
              Amount of noise added to input image. Values that approach 1.0
              allow for lots of variations but will also produce images that are
              not semantically consistent with the input.
            </div>
          )}
        </TooltipComponent>
      </OptionsRowLabel>
      <FlexRow
        style={{
          alignItems: 'center',
          position: 'relative'
        }}
        gap={3}
      >
        {input.useMultiDenoise && (
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
        )}
        {!input.useMultiDenoise && (
          <>
            <div className={styles['slider-wrapper']}>
              <Slider
                value={input.denoising_strength}
                min={0.0}
                max={1.0}
                step={0.05}
                onChange={(e: any) => {
                  setInput({ denoising_strength: e.target.value })
                }}
              />
            </div>
            <NumberInput
              className={styles['input-width']}
              min={0.0}
              max={1.0}
              // disabled={disabled}
              onBlur={() => {
                // Ensure the input is a number and limit it to 2 decimal places
                const formattedValue = Number(input.denoising_strength).toFixed(
                  2
                )

                // Update the state with the formatted value
                setInput({ denoising_strength: formattedValue })
              }}
              onInputChange={(e) => {
                setInput({
                  denoising_strength: e.target.value
                })
              }}
              onMinusClick={() => {
                const newValue = Number(input.denoising_strength) - 0.05
                if (newValue < 0.0) {
                  return
                }
                setInput({
                  denoising_strength: newValue.toFixed(2)
                })
              }}
              onPlusClick={() => {
                const newValue = Number(input.denoising_strength) + 0.05
                if (newValue > 1.0) {
                  return
                }
                setInput({
                  denoising_strength: newValue.toFixed(2)
                })
              }}
              step={0.05}
              value={input.denoising_strength as number}
              width="100%"
            />
          </>
        )}
        <div
          className="label_padding"
          style={{ height: '16px', width: '1px' }}
        />
        {!hideOptions && (
          <Button
            className={styles['options-btn']}
            onClick={() => setShowDropdown(true)}
          >
            <IconSettings stroke={1.5} />
          </Button>
        )}
        {showDropdown && (
          <DropdownOptions
            handleClose={() => setShowDropdown(false)}
            title="Denoise options"
            top="40px"
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
      </FlexRow>
    </OptionsRow>
  )
}
