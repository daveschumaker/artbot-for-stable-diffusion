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

interface ClipSkipOptions {
  hideOptions?: boolean
}

export default function ClipSkip({ hideOptions = false }: ClipSkipOptions) {
  const { input, setInput } = useInput()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        columnGap: '8px',
        position: 'relative',
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
          minWidth: 'var(--options-label-width)',
          width: 'var(--options-label-width)'
        }}
      >
        CLIP skip
        <TooltipComponent tooltipId="clipskip-tooltip">
          Determine how early to stop processing a prompt using CLIP. Higher
          values stop processing earlier. Default is 1 (no skip).
        </TooltipComponent>
      </div>
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
        <FlexRow gap={4}>
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
              if (input.clipskip - 1 < 1) {
                return
              }

              setInput({ clipskip: input.clipskip - 1 })
            }}
            onPlusClick={() => {
              if (input.clipskip + 1 > 12) {
                return
              }

              setInput({ clipskip: input.clipskip + 1 })
            }}
            step={1}
            value={input.clipskip}
            width="100%"
          />
        </FlexRow>
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
    </div>
  )
}
