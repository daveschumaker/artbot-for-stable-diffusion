import * as DOMPurify from 'dompurify'

export const handleConvertLora = (rawLoraDetails: any) => {
  const { modelVersions = [] } = rawLoraDetails
  const { files = [], images = [] } = modelVersions[0]

  // if (
  //   files[0]?.sizeKB &&
  //   files[0]?.sizeKB > 220000 &&
  //   !curatedLoras.includes(data.id)
  // ) {
  //   setErrorMsg('Unable to load: LORA size is over 220MB.')
  //   return
  // }

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
