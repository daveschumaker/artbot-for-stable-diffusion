import { useCallback } from 'react'
import NumericInputSlider from '../NumericInputSlider'
import TooltipComponent from 'app/_components/TooltipComponent'
import Checkbox from 'app/_components/Checkbox'
import FlexCol from 'app/_components/FlexCol'
import { useInput } from 'app/_modules/InputProvider/context'
import styles from './component.module.css'

const PostProcessors = () => {
  const { input, setInput } = useInput()

  const getPostProcessing = useCallback(
    (value: string) => {
      return input.post_processing.includes(value)
    },
    [input.post_processing]
  )

  const handlePostProcessing = useCallback(
    (value: string) => {
      let newPost = [...input.post_processing]
      const index = newPost.indexOf(value)

      if (index > -1) {
        newPost.splice(index, 1)
      } else {
        newPost.push(value)
      }

      setInput({ post_processing: newPost })
    },
    [input.post_processing, setInput]
  )

  return (
    <div className="flex flex-col gap-2 items-start">
      <div
        className={styles.label}
        style={{
          marginBottom: '8px'
        }}
      >
        Post-processing
        <TooltipComponent tooltipId={'post-processing-tooltip'}>
          Post-processing options such as face improvement and image upscaling.
        </TooltipComponent>
      </div>
      <FlexCol className="items-start gap-2">
        <Checkbox
          label={`GFPGAN (improves faces)`}
          checked={getPostProcessing('GFPGAN')}
          onChange={() => handlePostProcessing('GFPGAN')}
        />
        <Checkbox
          label={`CodeFormers (improves faces)`}
          checked={getPostProcessing('CodeFormers')}
          onChange={() => handlePostProcessing('CodeFormers')}
        />
        {(getPostProcessing('GFPGAN') || getPostProcessing('CodeFormers')) && (
          <NumericInputSlider
            label="Strength"
            tooltip="0.05 is the weakest effect (barely noticeable improvements), while 1.0 is the strongest effect."
            from={0.05}
            to={1.0}
            step={0.05}
            input={input}
            setInput={setInput}
            fieldName="facefixer_strength"
            fullWidth
          />
        )}
        <Checkbox
          label={`Strip background`}
          checked={getPostProcessing(`strip_background`)}
          onChange={() => handlePostProcessing(`strip_background`)}
        />
      </FlexCol>
    </div>
  )
}

export default PostProcessors
