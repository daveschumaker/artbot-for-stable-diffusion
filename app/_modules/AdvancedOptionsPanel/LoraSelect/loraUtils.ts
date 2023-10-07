import * as DOMPurify from 'dompurify'

export const handleConvertLora = (rawLoraDetails: any) => {
  const { modelVersions = [] } = rawLoraDetails
  const { files = [], images = [] } = modelVersions[0]

  return {
    name: rawLoraDetails.id,
    label: rawLoraDetails.name,
    description: DOMPurify.sanitize(rawLoraDetails.description || ''),
    baseModel: modelVersions[0].baseModel,
    trainedWords: modelVersions[0].trainedWords,
    image: images[0] && images[0].url ? images[0].url : '',
    sizeKb: files[0].sizeKB
  }
}
