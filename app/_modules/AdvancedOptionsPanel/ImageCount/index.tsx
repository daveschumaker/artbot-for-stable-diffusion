import FlexRow from 'app/_components/FlexRow'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import NumberInput from 'app/_components/NumberInput'
import { MAX_IMAGES_PER_JOB } from '_constants'
import { useCallback, useState } from 'react'
import { useInput } from 'app/_modules/InputProvider/context'

export default function ImageCount() {
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
    <div style={{ marginBottom: '12px' }}>
      <SubSectionTitle>
        Number of images
        <span style={{ fontSize: '12px', fontWeight: '400' }}>
          &nbsp;(1 - {MAX_IMAGES_PER_JOB})
        </span>
      </SubSectionTitle>
      <FlexRow gap={4}>
        <NumberInput
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
          onChangeStep={handleChangeStep}
          step={step}
          value={input.numImages}
          width="100%"
        />
      </FlexRow>
    </div>
  )
}
