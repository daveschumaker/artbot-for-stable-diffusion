import FlexRow from 'app/_components/FlexRow'
import { Button } from 'app/_components/Button'
import { IconSettings } from '@tabler/icons-react'
import { useState } from 'react'
import DropdownOptions from 'app/_modules/DropdownOptions'
import Checkbox from 'app/_components/Checkbox'
import Input from 'app/_components/Input'
import TooltipComponent from 'app/_components/TooltipComponent'
import { useInput } from 'app/_modules/InputProvider/context'
import styles from './clipskip.module.css'
import NumberInput from 'app/_components/NumberInput'
import Slider from 'app/_components/Slider'
import OptionsRow from 'app/_modules/AdvancedOptionsPanelV2/OptionsRow'
import OptionsRowLabel from 'app/_modules/AdvancedOptionsPanelV2/OptionsRowLabel'

interface ClipSkipOptions {
  hideOptions?: boolean
}

export default function ClipSkip({ hideOptions = false }: ClipSkipOptions) {
  const { input, setInput } = useInput()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <OptionsRow>
      <OptionsRowLabel>
        CLIP skip
        <TooltipComponent tooltipId="clipskip-tooltip">
          Determine how early to stop processing a prompt using CLIP. Higher
          values stop processing earlier. Default is 1 (no skip).
        </TooltipComponent>
      </OptionsRowLabel>
      <FlexRow style={{ columnGap: '7px', position: 'relative' }}>
        {input.useMultiClip && (
          <Input
            // @ts-ignore
            type="text"
            name="multiClip"
            onChange={(e: any) => {
              setInput({ multiClip: e.target.value })
            }}
            placeholder="3,5,7,9"
            // @ts-ignore
            value={input.multiClip}
            width="100%"
          />
        )}
        {!input.useMultiClip && (
          <>
            <div className={styles['slider-wrapper']}>
              <Slider
                value={input.clipskip}
                min={1}
                max={12}
                step={1}
                onChange={(e: any) => {
                  setInput({ clipskip: e.target.value })
                }}
              />
            </div>
            <NumberInput
              className={styles['input-width']}
              min={1}
              max={12}
              // disabled={disabled}
              onInputChange={(e) => {
                setInput({ clipskip: Number(e.target.value) })
              }}
              onMinusClick={() => {
                if (isNaN(input.clipskip)) {
                  setInput({ clipskip: 1 })
                  return
                }

                if (input.clipskip - 1 < 1) {
                  return
                }

                setInput({ clipskip: input.clipskip - 1 })
              }}
              onPlusClick={() => {
                if (isNaN(input.clipskip)) {
                  setInput({ clipskip: 1 })
                  return
                }

                if (input.clipskip + 1 > 12) {
                  return
                }

                setInput({ clipskip: input.clipskip + 1 })
              }}
              step={1}
              value={isNaN(input.clipskip) ? 1 : input.clipskip}
              width="100%"
            />
          </>
        )}
        {!hideOptions && (
          <Button
            className={styles['clip-btn']}
            onClick={() => setShowDropdown(true)}
          >
            <IconSettings stroke={1.5} />
          </Button>
        )}
        {showDropdown && (
          <DropdownOptions
            handleClose={() => setShowDropdown(false)}
            title="CLIP options"
            top="40px"
          >
            <div style={{ padding: '8px 0' }}>
              <Checkbox
                label="Use multi-CLIP skip?"
                checked={input.useMultiClip}
                onChange={(bool: boolean) => {
                  setInput({ useMultiClip: bool })
                }}
              />
            </div>
          </DropdownOptions>
        )}
      </FlexRow>
    </OptionsRow>
  )
}
