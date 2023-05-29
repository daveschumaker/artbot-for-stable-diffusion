// Init list via: https://civitai.com/api/v1/models?types=LORA&sort=Highest%20Rated
// import { kilobytesToGigabytes } from 'utils/numberUtils'
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
  files: Array<{
    sizeKB: number
  }>
}

export interface ParsedLoraModel {
  displayName: string
  name: string
  trainedWords: string[]
  // url: string
  downloads: number
  description: string
  sizeKb: number
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
    const models: ParsedLoraModel[] = []

    // TODO: Check limit against 10GB that workers download
    // let totalSizeKb = 0

    modelResponse.forEach((item) => {
      const {
        name = '',
        description = '',
        modelVersions = []
      }: LoraModelItem = item || {}

      if (modelVersions.length === 0) {
        return []
      }

      modelVersions.forEach((model: LoraModelVersion, i: number) => {
        if (i > 0) {
          return
        }

        const { files } = model
        const sizeKb = files[0].sizeKB
        // @ts-ignore
        const loraName = model.files[0].name.split('.')[0]

        // totalSizeKb += sizeKb

        models.push({
          displayName: `${name} / ${model.name}`,
          name: loraName,
          trainedWords: model.trainedWords,
          // url: model.downloadUrl,
          downloads: model?.stats?.downloadCount,
          description: stripHTMLTags(description),
          sizeKb
        })
      })
    })

    // console.log(`LORAs`, models.length)
    // console.log(`LORA Total Size`, totalSizeKb)
    // console.log(`LORA Total Size GB`, kilobytesToGigabytes(totalSizeKb))

    return [...models]
  }
}

export default Loras
