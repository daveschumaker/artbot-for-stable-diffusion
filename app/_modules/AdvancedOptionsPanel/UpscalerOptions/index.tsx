import Checkbox from 'app/_components/Checkbox'
import TextTooltipRow from 'app/_components/TextTooltipRow'
import TooltipComponent from 'app/_components/TooltipComponent'
import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'
import PromptInputSettings from 'app/_data-models/PromptInputSettings'
import { useCallback } from 'react'
import SubSectionTitle from 'app/_components/SubSectionTitle'

interface Props {
  input: DefaultPromptInput
  setInput: any
}

export const UPSCALERS = [
  'RealESRGAN_x4plus',
  'RealESRGAN_x4plus_anime_6B',
  'NMKD_Siax',
  '4x_AnimeSharp'
]

const UpscalerOptions = ({ input, setInput }: Props) => {
  const getPostProcessing = useCallback(
    (value: string) => {
      return input.post_processing.indexOf(value) >= 0
    },
    [input.post_processing]
  )

  const handlePostProcessing = useCallback(
    (value: string) => {
      let newPost: string[] = []
      const index = input.post_processing.indexOf(value)

      if (index > -1) {
        newPost = [...input.post_processing]
        newPost.splice(index, 1)
      } else {
        newPost = input.post_processing.filter((postprocName: string) => {
          return UPSCALERS.indexOf(postprocName) === -1
        })

        newPost.push(value)
      }

      PromptInputSettings.set('post_processing', newPost)
      setInput({ post_processing: newPost })
    },
    [input.post_processing, setInput]
  )

  return (
    <div className="flex flex-col gap-2 items-start">
      <SubSectionTitle>
        <TextTooltipRow>
          Upscalers
          <TooltipComponent tooltipId={'upscalers-tooltip'}>
            Upscales your image up to 4x. Some upscalers are tuned to specific
            styles. Only 1 can be selected at a time.
          </TooltipComponent>
        </TextTooltipRow>
      </SubSectionTitle>
      {UPSCALERS.map((upscalerName) => {
        return (
          <Checkbox
            key={upscalerName}
            label={upscalerName}
            checked={getPostProcessing(upscalerName)}
            onChange={() => handlePostProcessing(upscalerName)}
          />
        )
      })}
    </div>
  )
}

export default UpscalerOptions
