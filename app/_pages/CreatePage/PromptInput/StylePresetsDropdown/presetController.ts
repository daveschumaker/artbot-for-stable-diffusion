import { HordePreset } from '_types/horde'
import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'
import { stylePresets } from './presets'

export const handleUsePreset = ({
  key,
  input
}: {
  key: string
  input: DefaultPromptInput
}) => {
  const presetDetails: HordePreset = stylePresets[key]
  let [positive, negative = ''] = presetDetails.prompt.split('###')
  positive = positive.replace('{p}', input.prompt)
  positive = positive.replace('{np}', '')
  negative = negative.replace('{np}', '')
  negative = `${negative} ${input.negative}`

  const updateInput: Partial<DefaultPromptInput> = {
    prompt: positive,
    hires: presetDetails.hires_fix ? presetDetails.hires_fix : input.hires,
    karras: presetDetails.karras ? presetDetails.karras : input.karras,
    negative: negative.trim(),
    models: presetDetails.model ? [presetDetails.model] : input.models,
    sampler: presetDetails.sampler_name
      ? presetDetails.sampler_name
      : input.sampler,
    cfg_scale: presetDetails.cfg_scale
      ? presetDetails.cfg_scale
      : input.cfg_scale,
    loras: presetDetails.loras ? presetDetails.loras : input.loras,
    tis: presetDetails.tis ? presetDetails.tis : input.tis,
    steps: presetDetails.steps ? presetDetails.steps : input.steps,
    orientationType: input.orientationType,
    height: input.height,
    width: input.width
  }

  if (presetDetails.width && presetDetails.height) {
    updateInput.orientationType = 'custom'
    updateInput.height = presetDetails.height
    updateInput.width = presetDetails.width
  }

  return updateInput
}
