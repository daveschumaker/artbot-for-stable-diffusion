import { ModelVersion } from '_types/civitai'
import { sanitize } from 'isomorphic-dompurify'

export const handleConvertLora = (rawLoraDetails: ModelVersion) => {
  console.log(`rawLoraDetails`, rawLoraDetails)
  const { files = [], images = [] } = rawLoraDetails

  return {
    parentModelId: rawLoraDetails.modelId,
    name: rawLoraDetails.id,
    label: rawLoraDetails.name,
    description: sanitize(rawLoraDetails.description || ''),
    baseModel: rawLoraDetails.baseModel,
    trainedWords: rawLoraDetails.trainedWords,
    image: images[0] && images[0].url ? images[0].url : '',
    sizeKb: files[0].sizeKB
  }
}
