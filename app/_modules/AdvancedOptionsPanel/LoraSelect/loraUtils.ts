import { SavedLora } from '_types/artbot'
import { Embedding, ModelVersion } from '_types/civitai'
import { sanitize } from 'isomorphic-dompurify'

export const handleConvertLora = (
  lora: Embedding,
  version: ModelVersion
): SavedLora => {
  const { files = [], images = [] } = version

  return {
    baseModelId: lora.id as number,
    parentModelId: version.modelId,
    name: version.id,
    label: lora.name,
    versionLabel: version.name,
    versionId: version.id as number,
    description: sanitize(version.description || lora.description || ''),
    baseModel: version.baseModel,
    trainedWords: version.trainedWords,
    image:
      images[0] && images[0].type === 'image' && images[0].url
        ? images[0].url
        : '',
    sizeKb: files[0].sizeKB,
    model: 1,
    clip: 1,
    is_version: version.modelId && version.id !== version.modelId ? true : false
  }
}
