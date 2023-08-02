import PromptInputSettings from '../../../../models/PromptInputSettings'
import { useEffect, useState } from 'react'
import InputSwitchV2 from '../InputSwitchV2'
const HiresFix = ({ input, setInput }: any) => {
  const [error, setError] = useState('')

  useEffect(() => {
    if ((input.source_image || input.source_mask) && input.hires) {
      setError('Can only be used for text2img requests')
      setInput({ hires: false })
      return
    }

    if (error && !input.source_image && !input.source_mask) {
      setError('')
    }
  }, [error, input, setInput])

  return (
    <InputSwitchV2
      label="Hires fix"
      tooltip="Partially renders image at a lower resolution before upscaling it and adding more detail. Useful to avoid things like double heads when requesting higher resolution images."
      // @ts-ignore
      moreInfoLink={
        input.source_image && (
          <div className="mt-[-4px] text-xs text-slate-500 dark:text-slate-400 font-[600]">
            <strong>Note:</strong> Cannot be used for img2img requests
          </div>
        )
      }
      disabled={input.source_image || error ? true : false}
      handleSwitchToggle={() => {
        if (!input.hires) {
          PromptInputSettings.set('hires', true)
          setInput({ hires: true })
        } else {
          PromptInputSettings.set('hires', false)
          setInput({ hires: false })
        }
      }}
      checked={input.hires}
    />
  )
}

export default HiresFix
