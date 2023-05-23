// Init list via: https://civitai.com/api/v1/models?types=LORA&sort=Highest%20Rated
import modelResponse from './loras.json'

export interface LoraModelItem {
  name: string
  description: string | null
  modelVersions: LoraModelVersion[]
}

export interface LoraModelVersion {
  name: string
  trainedWords: string[]
  downloadUrl: string
  stats: {
    downloadCount: number
  }
}

export interface ParsedLoraModel {
  displayName: string
  name: string
  trainedWords: string[]
  url: string
  downloads: number
  description: string
}

function stripHTMLTags(input: string | null = '') {
  if (!input) {
    return ''
  }

  // Remove HTML tags using regular expressions
  var output = input.replace(/<[^>]+>/g, '')

  // Remove extra whitespace and trim the result
  output = output.replace(/\s+/g, ' ').trim()

  return output
}

class Loras {
  static getModels = () => {
    const { items = [] } = modelResponse
    const models: ParsedLoraModel[] = []

    items.forEach((item) => {
      const {
        name = '',
        description = '',
        modelVersions = []
      }: LoraModelItem = item || {}

      if (modelVersions.length === 0) {
        return []
      }

      modelVersions.forEach((model: LoraModelVersion) => {
        models.push({
          displayName: `${name} / ${model.name}`,
          name: model.name,
          trainedWords: model.trainedWords,
          url: model.downloadUrl,
          downloads: model?.stats?.downloadCount,
          description: stripHTMLTags(description)
        })
      })
    })

    return [...models]
  }
}

export default Loras
