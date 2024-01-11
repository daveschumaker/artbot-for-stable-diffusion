import Checkbox from 'app/_components/Checkbox'
import TooltipComponent from 'app/_components/TooltipComponent'
import { useCallback } from 'react'
import { useInput } from 'app/_modules/InputProvider/context'
import FlexCol from 'app/_components/FlexCol'
import styles from './component.module.css'

export const UPSCALERS = [
  'RealESRGAN_x2plus',
  'RealESRGAN_x4plus',
  'RealESRGAN_x4plus_anime_6B',
  'NMKD_Siax',
  '4x_AnimeSharp'
]

const UpscalerOptions = () => {
  const { input, setInput } = useInput()

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
        Upscalers
        <TooltipComponent tooltipId={'upscalers-tooltip'}>
          Upscales your image by a set amount. Some upscalers are tuned to
          specific styles. Only 1 can be selected at a time.
        </TooltipComponent>
      </div>
      <FlexCol className="items-start gap-2">
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
      </FlexCol>
    </div>
  )
}

export default UpscalerOptions
