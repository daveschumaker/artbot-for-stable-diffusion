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
import styles from './guidance.module.css'
import NumberInput from 'app/_components/NumberInput'
import Slider from 'app/_components/Slider'

interface GuidanceProps {
  hideOptions?: boolean
}

const STEP = 0.5

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
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            columnGap: '8px',
            marginBottom: '12px',
            width: '100%'
          }}
        >
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'row',
              columnGap: '2px',
              fontWeight: 700,
              fontSize: '14px',
              width: 'var(--options-label-width)'
            }}
          >
            Guidance
            <TooltipComponent tooltipId="guidance-tooltip">
              Higher numbers follow the prompt more closely. Lower numbers give
              more creativity.
            </TooltipComponent>
          </div>
          <FlexRow gap={4} justifyContent="space-between">
            <div className={styles['slider-wrapper']}>
              <Slider
                value={input.cfg_scale}
                min={0.5}
                max={30}
                step={0.5}
                onChange={(e: any) => {
                  setInput({ cfg_scale: e.target.value })
                }}
              />
            </div>
            <NumberInput
              className={styles['input-width']}
              min={0.5}
              max={30}
              // disabled={disabled}
              onInputChange={(e) => {
                setInput({ cfg_scale: Number(e.target.value) })
              }}
              onMinusClick={() => {
                if (input.cfg_scale - STEP < STEP) {
                  return
                }

                setInput({ cfg_scale: input.cfg_scale - STEP })
              }}
              onPlusClick={() => {
                if (input.cfg_scale + STEP > 30) {
                  return
                }

                setInput({ cfg_scale: input.cfg_scale + STEP })
              }}
              step={STEP}
              value={input.cfg_scale}
              width="100%"
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
              <Button
                className={styles['settings-btn']}
                onClick={() => setShowDropdown(true)}
              >
                <IconSettings stroke={1.5} />
              </Button>
            )}
          </FlexRow>
        </div>
      )}
    </FlexRow>
  )
}
