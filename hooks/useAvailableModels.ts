import { useStore } from 'statery'
import DefaultPromptInput from 'models/DefaultPromptInput'
import { modelStore } from 'store/modelStore'
import ImageModels from 'models/ImageModels'

export function useAvailableModels({
  input,
  filterNsfw = false,
  sort = 'workers'
}: {
  input: DefaultPromptInput
  filterNsfw?: boolean
  sort?: string
}) {
  const { availableModels, modelDetails } = useStore(modelStore)

  const filteredModels = ImageModels.getValidModels({
    availableModels,
    modelDetails,
    input,
    filterNsfw,
    sort
  })

  const modelsOptions = ImageModels.dropdownOptions({ filteredModels })

  return [modelsOptions]
}
