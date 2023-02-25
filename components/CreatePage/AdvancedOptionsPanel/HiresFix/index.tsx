import Section from '../../../UI/Section'
import SubSectionTitle from '../../../UI/SubSectionTitle'
import TextTooltipRow from '../../../UI/TextTooltipRow'
import Tooltip from '../../../UI/Tooltip'
import Switch from 'react-switch'
import PromptInputSettings from '../../../../models/PromptInputSettings'
import { useEffect, useState } from 'react'
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
    <Section>
      <SubSectionTitle>
        <TextTooltipRow>
          Hires fix
          <Tooltip left="-20" width="240px">
            Partially renders image at a lower resolution before upscaling it
            and adding more detail. Useful to avoid things like double heads
            when requesting higher resolution images.
          </Tooltip>
        </TextTooltipRow>
        {input.source_image && (
          <div className="mt-[-4px] text-sm text-slate-500 dark:text-slate-400 font-[600]">
            <strong>Note:</strong> Cannot be used for img2img requests
          </div>
        )}
        {error && (
          <div className="mt-[-6px] text-sm text-slate-500 dark:text-slate-400 font-[600]">
            <strong>Note:</strong> {error}
          </div>
        )}
      </SubSectionTitle>
      <Switch
        disabled={input.source_image || error ? true : false}
        onChange={() => {
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
    </Section>
  )
}

export default HiresFix
