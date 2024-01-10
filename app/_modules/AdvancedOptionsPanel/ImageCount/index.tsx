import FlexRow from 'app/_components/FlexRow'
import NumberInput from 'app/_components/NumberInput'
import { MAX_IMAGES_PER_JOB } from '_constants'
import { useCallback, useState } from 'react'
import { useInput } from 'app/_modules/InputProvider/context'
import Slider from 'app/_components/Slider'
import styles from './imageCount.module.css'
import { useWindowSize } from 'app/_hooks/useWindowSize'
import OptionsRow from 'app/_modules/AdvancedOptionsPanelV2/OptionsRow'
import OptionsRowLabel from 'app/_modules/AdvancedOptionsPanelV2/OptionsRowLabel'

export default function ImageCount() {
  const { width } = useWindowSize()
  const { input, setInput } = useInput()
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

  return (
    <OptionsRow>
      <OptionsRowLabel>Images</OptionsRowLabel>
      <FlexRow gap={4} justifyContent="space-between">
        <div className={styles['slider-wrapper']}>
          <Slider
            value={input.numImages}
            min={1}
            max={MAX_IMAGES_PER_JOB}
            step={1}
            onChange={(e: any) => {
              setInput({ numImages: e.target.value })
            }}
          />
        </div>
        <NumberInput
          className={styles['input-width']}
          min={1}
          max={MAX_IMAGES_PER_JOB}
          // disabled={disabled}
          onInputChange={(e) => {
            setInput({ numImages: Number(e.target.value) })
          }}
          onMinusClick={() => {
            if (input.numImages - step < 1) {
              return
            }

            setInput({ numImages: input.numImages - step })
          }}
          onPlusClick={() => {
            if (input.numImages + step > MAX_IMAGES_PER_JOB) {
              return
            }

            setInput({ numImages: input.numImages + step })
          }}
          onChangeStep={width && width < 800 ? handleChangeStep : undefined}
          step={step}
          value={input.numImages}
          width="100%"
        />
      </FlexRow>
    </OptionsRow>
  )
}
