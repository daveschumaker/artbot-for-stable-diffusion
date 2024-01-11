import { client_fetchModelDetailsV2 } from 'app/_api/client_fetchModelDetailsV2'
import { client_fetchModelsAvailableV2 } from 'app/_api/client_fetchModelsAvailableV2'
import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'
import ImageModels from 'app/_data-models/ImageModels'
import { useCallback, useEffect, useState } from 'react'

export function useAvailableModels({
  input,
  filterNsfw = false,
  sort = 'workers'
}: {
  input: DefaultPromptInput
  filterNsfw?: boolean
  sort?: string
}) {
  const [filteredModels, setFilteredModels] = useState<any[]>([])

  const loadModels = useCallback(async () => {
    await client_fetchModelDetailsV2()
    await client_fetchModelsAvailableV2()

    const validModels = ImageModels.getValidModels({
      input,
      filterNsfw,
      sort
    })

    setFilteredModels(validModels)
  }, [filterNsfw, input, sort])

  useEffect(() => {
    loadModels()
  }, [loadModels])

  const modelsOptions = ImageModels.dropdownOptions({ filteredModels })

  return [modelsOptions, filteredModels]
}
