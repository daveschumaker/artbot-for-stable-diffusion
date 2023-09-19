import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'
import { modelStore } from 'app/_store/modelStore'

export const hasKeywords = (input: DefaultPromptInput) => {
  const modelDetails = modelStore?.state?.modelDetails

  let validModels = []
  let validLoras = []

  input.models.forEach((model) => {
    const details = modelDetails[model]
    if (!details) return

    if (details.trigger && details.trigger.length >= 1) {
      validModels.push(model)
    }
  })

  input.loras.forEach((obj: any) => {
    if (obj.trainedWords && obj.trainedWords.length > 0) {
      validLoras.push(obj.label)
    }
  })

  return validLoras.length > 0 || validModels.length > 0
}
