import FlexRow from 'app/_components/FlexRow'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import { GetSetPromptInput } from 'types/artbot'
import NumberInput from 'app/_components/NumberInput'
import { MAX_IMAGES_PER_JOB } from '_constants'

export default function ImageCount({ input, setInput }: GetSetPromptInput) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <SubSectionTitle>
        Number of images
        <span style={{ fontSize: '12px', fontWeight: '400' }}>
          &nbsp;(1 - {MAX_IMAGES_PER_JOB})
        </span>
      </SubSectionTitle>
      <FlexRow style={{ columnGap: '4px' }}>
        <NumberInput
          min={1}
          max={MAX_IMAGES_PER_JOB}
          // disabled={disabled}
          onInputChange={(e) => {
            setInput({ numImages: e.target.value })
          }}
          onMinusClick={() => {
            if (input.numImages - 1 < 1) {
              return
            }

            setInput({ numImages: input.numImages - 1 })
          }}
          onPlusClick={() => {
            if (input.numImages + 1 > MAX_IMAGES_PER_JOB) {
              return
            }

            setInput({ numImages: input.numImages + 1 })
          }}
          value={input.numImages}
          width="100%"
        />
      </FlexRow>
    </div>
  )
}
