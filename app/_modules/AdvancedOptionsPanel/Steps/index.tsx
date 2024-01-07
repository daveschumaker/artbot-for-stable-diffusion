import FlexRow from 'app/_components/FlexRow'
import { Button } from 'app/_components/Button'
import { IconSettings } from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import DropdownOptions from 'app/_modules/DropdownOptions'
import Checkbox from 'app/_components/Checkbox'
import Input from 'app/_components/Input'
import TooltipComponent from 'app/_components/TooltipComponent'
import { maxSteps } from 'app/_utils/validationUtils'
import { useStore } from 'statery'
import { userInfoStore } from 'app/_store/userStore'
import NumberInput from 'app/_components/NumberInput'
import { useInput } from 'app/_modules/InputProvider/context'
import styles from './steps.module.css'
import Slider from 'app/_components/Slider'
import { useWindowSize } from 'app/_hooks/useWindowSize'
interface StepsOptions {
  hideOptions?: boolean
}

export default function Steps({ hideOptions = false }: StepsOptions) {
  const { input, setInput } = useInput()
  const { width } = useWindowSize()

  const userState = useStore(userInfoStore)
  const { loggedIn } = userState

  const [showDropdown, setShowDropdown] = useState(false)
  const [step, setStep] = useState(1)

  const handleChangeStep = useCallback(() => {
    if (step === 1) {
      setStep(5)
    } else if (step === 5) {
      setStep(10)
    } else {
      setStep(1)
    }
  }, [step])

  const MAX_STEPS = maxSteps({
    sampler: input.sampler,
    loggedIn: loggedIn === true ? true : false,
    isSlider: true
  })

  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        columnGap: '8px',
        marginBottom: '8px',
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
        Steps
        <TooltipComponent tooltipId="steps-tooltip">
          Fewer steps generally result in quicker image generations. Many models
          achieve full coherence after a certain number of finite steps (60 -
          90). Keep your initial queries in the 30 - 50 range for best results.
        </TooltipComponent>
      </div>
      {input.useMultiSteps && (
        <Input
          // @ts-ignore
          type="text"
          name="multiSteps"
          onChange={(e: any) => {
            setInput({ multiSteps: e.target.value })
          }}
          placeholder="16, 20, 25, 40"
          // @ts-ignore
          value={input.multiSteps}
          width="100%"
        />
      )}
      {!input.useMultiSteps && (
        <>
          <FlexRow justifyContent="space-between">
            <div className={styles['slider-wrapper']}>
              <Slider
                value={input.steps}
                min={1}
                max={MAX_STEPS}
                step={1}
                onChange={(e: any) => {
                  setInput({ steps: e.target.value })
                }}
              />
            </div>
            <NumberInput
              className={styles['input-width']}
              min={1}
              max={MAX_STEPS}
              // disabled={disabled}
              onInputChange={(e) => {
                setInput({ denoising_strength: e.target.value })
              }}
              onMinusClick={() => {
                if (input.steps - step < 1) {
                  return
                }

                setInput({ steps: input.steps - step })
              }}
              onPlusClick={() => {
                if (input.steps + step > MAX_STEPS) {
                  return
                }

                setInput({ steps: input.steps + step })
              }}
              onChangeStep={width && width < 800 ? handleChangeStep : undefined}
              step={step}
              value={input.steps}
              width="100%"
            />
          </FlexRow>
        </>
      )}
      {!hideOptions && (
        <Button
          className={styles['steps-btn']}
          onClick={() => setShowDropdown(true)}
        >
          <IconSettings stroke={1.5} />
        </Button>
      )}
      {showDropdown && (
        <DropdownOptions
          handleClose={() => setShowDropdown(false)}
          title="Step options"
          top="40px"
        >
          <div style={{ padding: '8px 0' }}>
            <Checkbox
              label="Use multi steps?"
              checked={input.useMultiSteps}
              onChange={(bool: boolean) => {
                setInput({ useMultiSteps: bool })
              }}
            />
          </div>
        </DropdownOptions>
      )}
    </div>
  )
}
