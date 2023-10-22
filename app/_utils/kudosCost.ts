// Modified from Litnine on Discord
// https://github.com/evguu/AI-Horde/blob/faq-edit/kudos/kudos_standalone.js
// and from AqualXX method on StableUI:
// https://github.com/aqualxx/stable-ui/blob/a685761440cd9ff55f86e6ee694adc147cd1971d/src/stores/generator.ts#L278
// Horde calculations:
// https://github.com/db0/AI-Horde/blob/main/horde/classes/stable/waiting_prompt.py#L204

import { Common } from '_types'
import AppSettings from 'app/_data-models/AppSettings'

interface IKudosCostParams {
  width: number
  height: number
  steps: number
  samplerName: string
  hasSourceImage: boolean
  denoisingStrength: number | Common
  postProcessors: string[]
  usesControlNet: boolean
  numImages: number
}

export const kudosCostV2 = ({
  width,
  height,
  steps,
  samplerName,
  hasSourceImage,
  denoisingStrength,
  postProcessors,
  usesControlNet,
  numImages
}: IKudosCostParams) => {
  const result =
    Math.pow(height * width - 64 * 64, 1.75) /
    Math.pow(1024 * 1024 - 64 * 64, 1.75)

  const accurateSteps = getAccurateSteps(
    steps,
    samplerName,
    hasSourceImage,
    denoisingStrength
  )

  let kudos = 0.1232 * accurateSteps + result * (0.1232 * accurateSteps * 8.75)
  for (let i = 0; i < postProcessors.length; i++) kudos *= 1.2
  kudos *= usesControlNet && hasSourceImage ? 3 : 1
  kudos *= hasSourceImage ? 1.3 : 1
  kudos *=
    postProcessors.includes('RealESRGAN_x4plus') ||
    postProcessors.includes('RealESRGAN_x4plus_anime_6B')
      ? 1.3
      : 1
  kudos *= postProcessors.includes('CodeFormers') ? 1.3 : 1
  kudos *= postProcessors.includes('strip_background') ? 1.2 : 1
  kudos += AppSettings.get('shareImagesExternally') === true ? 1 : 3
  kudos += AppSettings.get('slow_workers') === false ? 1.2 : 1
  kudos *= numImages

  const useBlocklist = AppSettings.get('blockedWorkers')
  if (useBlocklist) {
    kudos *= 1.1
  }

  // ArtBot kudos tax (1 x n image requests)
  // https://discord.com/channels/781145214752129095/1020707945694101564/1106152512781828146
  kudos += numImages

  return Math.round(kudos)
}

export const getAccurateSteps = (
  steps: number,
  samplerName: string,
  hasSourceImage: boolean,
  denoisingStrength: number | Common
) => {
  const samplerAccurateSteps = () => {
    if (['k_dpm_adaptive'].includes(samplerName)) {
      return 50
    }

    if (
      ['k_heun', 'k_dpm_2', 'k_dpm_2_a', 'k_dpmpp_2s_a'].includes(samplerName)
    ) {
      return steps * 2
    }
    return steps
  }

  steps = samplerAccurateSteps()

  // There is a bug on the server: cost is supposed to be affected, but it isn't.
  // TODO: Remove this check when this bug is fixed server-side.
  const doesDenoisingStrengthAffectKudosCost = false

  if (hasSourceImage && doesDenoisingStrengthAffectKudosCost) {
    steps *= denoisingStrength || 0.8
  }

  return steps
}
