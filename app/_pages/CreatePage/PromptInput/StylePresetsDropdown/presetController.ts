import { HordePreset } from '_types/horde'
import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'
import { stylePresets } from './presets'

function processPositive(positive: string, inputPositive: string): string {
  // Replace '{p}' with 'inputPositive' and trim.
  const replacedPositive = positive.replace(/\{p\}/g, inputPositive.trim())

  // Split and clean both 'replacedPositive' and 'inputPositive' strings.
  const positiveParts = replacedPositive
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)

  const inputParts = inputPositive
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)

  // Combine both arrays.
  const combinedParts = positiveParts.concat(inputParts)

  // Deduplicate: Convert to a Set and back to an Array.
  const uniqueParts = [...new Set(combinedParts)]

  // Join the parts back into a comma-separated string.
  return uniqueParts.join(', ')
}

function combineAndDeduplicate(
  negative: string,
  inputNegative: string
): string {
  // Normalize and split the 'negative' string, then filter out empty strings.
  const negatives = negative
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  // Normalize and split the 'input.negative' string, then filter out empty strings.
  const inputNegatives = inputNegative
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  // Merge both arrays.
  const combined = negatives.concat(inputNegatives)

  // Deduplicate: convert to a Set and back to an Array.
  const uniqueCombined = [...new Set(combined)]

  // Convert the array back to a comma-separated string.
  return uniqueCombined.join(', ')
}

export const handleUsePreset = ({
  key,
  input
}: {
  key: string
  input: DefaultPromptInput
}) => {
  const presetDetails: HordePreset = stylePresets[key]
  let [positive, negative = ''] = presetDetails.prompt.split('###')
  // positive = positive.replace('{p}', input.prompt)

  positive = positive.replace('{np}', '')
  positive = processPositive(positive, input.prompt)

  negative = negative.replace('{np}', '')
  negative = combineAndDeduplicate(negative, input.negative)

  const updateInput: Partial<DefaultPromptInput> = {
    ...new DefaultPromptInput(),
    prompt: positive,
    hires: presetDetails.hires_fix
      ? presetDetails.hires_fix
      : new DefaultPromptInput().hires,
    karras: presetDetails.karras
      ? presetDetails.karras
      : new DefaultPromptInput().karras,
    negative: negative.trim(),
    models: presetDetails.model
      ? [presetDetails.model]
      : new DefaultPromptInput().models,
    sampler: presetDetails.sampler_name
      ? presetDetails.sampler_name
      : new DefaultPromptInput().sampler,
    cfg_scale: presetDetails.cfg_scale
      ? presetDetails.cfg_scale
      : new DefaultPromptInput().cfg_scale,
    // @ts-ignore
    loras: presetDetails.loras
      ? presetDetails.loras
      : new DefaultPromptInput().loras,
    // @ts-ignore
    tis: presetDetails.tis ? presetDetails.tis : new DefaultPromptInput().tis,
    seed: input.seed,
    steps: presetDetails.steps
      ? presetDetails.steps
      : new DefaultPromptInput().steps,
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
