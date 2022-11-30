import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent
} from 'lz-string'

class ShareLinkDetails {
  constructor() {}

  static encode({
    cfg_scale = 7,
    height = 512,
    karras = true,
    models = [],
    negative = '',
    post_processing = [],
    prompt = '',
    sampler = 'k_euler',
    seed = '',
    steps = 20,
    stylePreset = 'none',
    triggers = [],
    width = 512
  }) {
    const [model] = models

    // params will serialize data needed for creating exact same prompt.
    const linkData = {
      prompt,
      negative,
      params: [
        'v1', // Allows us to check for updates to link handling in future
        height,
        width,
        sampler,
        steps,
        cfg_scale,
        seed,
        model,
        karras,
        [...post_processing],
        [...triggers],
        stylePreset
      ]
    }

    const string = JSON.stringify(linkData)
    const compressed = compressToEncodedURIComponent(string)

    return compressed
  }

  static decode(uri: string) {
    const string = decompressFromEncodedURIComponent(uri) || '{}'
    const linkData = JSON.parse(string)
    const { prompt, negative, params } = linkData
    const [
      ,
      // version number. not currently used
      height,
      width,
      sampler,
      steps,
      cfg_scale,
      seed,
      model,
      karras,
      post_processing,
      triggers,
      stylePreset
    ] = params

    return {
      prompt,
      negative,
      height,
      width,
      sampler,
      steps,
      cfg_scale,
      seed,
      models: [model],
      karras,
      post_processing,
      triggers,
      orientationType: 'custom',
      stylePreset
    }
  }
}

export default ShareLinkDetails
