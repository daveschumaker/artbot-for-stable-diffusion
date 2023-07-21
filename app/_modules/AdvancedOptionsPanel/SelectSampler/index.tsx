import Select from 'app/_components/Select'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import Samplers from 'models/Samplers'
import { GetSetPromptInput } from 'types/artbot'
import { SourceProcessing } from 'types/horde'

export default function SelectSampler({ input, setInput }: GetSetPromptInput) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <SubSectionTitle>Sampler</SubSectionTitle>
      {(input.source_processing === SourceProcessing.InPainting &&
        input.models[0] === 'stable_diffusion_inpainting') ||
      (input.source_image && input.control_type !== '') ? (
        <div className="mt-[-6px] text-sm text-slate-500 dark:text-slate-400 font-[600]">
          Note: Sampler disabled when controlnet or inpainting model is used.
        </div>
      ) : (
        <Select
          options={Samplers.dropdownOptions({
            model: input.models[0],
            isImg2Img: input.source_image
          })}
          onChange={(obj: { value: string; label: string }) => {
            // PromptInputSettings.set('sampler', obj.value)
            setInput({ sampler: obj.value })
          }}
          value={Samplers.dropdownValue(input.sampler)}
        />
      )}
    </div>
  )
}
