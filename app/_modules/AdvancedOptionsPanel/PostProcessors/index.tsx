import { useCallback } from 'react'
import NumericInputSlider from '../NumericInputSlider'
import { GetSetPromptInput } from '_types/artbot'
import Section from 'app/_components/Section'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import TooltipComponent from 'app/_components/TooltipComponent'
import Checkbox from 'app/_components/Checkbox'
import FlexCol from 'app/_components/FlexCol'
import PromptInputSettings from 'app/_data-models/PromptInputSettings'
import TextTooltipRow from 'app/_components/TextTooltipRow'

const PostProcessors = ({ input, setInput }: GetSetPromptInput) => {
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

      PromptInputSettings.set('post_processing', newPost)
      setInput({ post_processing: newPost })
    },
    [input.post_processing, setInput]
  )

  return (
    <Section style={{ paddingTop: 0 }}>
      <SubSectionTitle pb={8}>
        <TextTooltipRow>
          Post-processing
          <TooltipComponent tooltipId={'post-processing-tooltip'}>
            Post-processing options such as face improvement and image
            upscaling.
          </TooltipComponent>
        </TextTooltipRow>
      </SubSectionTitle>
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
    </Section>
  )
}

export default PostProcessors
