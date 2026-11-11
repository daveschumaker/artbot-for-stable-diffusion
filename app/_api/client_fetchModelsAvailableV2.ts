import { queryOptions } from '@tanstack/react-query'
import { basePath } from 'BASE_PATH'
import { setAvailableModels } from 'app/_store/modelStore'
import { clientHeader } from 'app/_utils/appUtils'
import { queryClient } from './queryClient'

const fetchAvailableModels = async (signal?: AbortSignal) => {
  const res = await fetch(`${basePath}/api/models/available`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'Client-Agent': clientHeader()
    },
    signal
  })
  const { success, models } = await res.json()
  if (!success) throw new Error('Unable to parse available models.')

  setAvailableModels(models)
  return models
}

/** Models workers are serving right now, with counts. Updates modelStore. */
export const availableModelsQuery = queryOptions({
  queryKey: ['artbot', 'models', 'available'],
  queryFn: ({ signal }) => fetchAvailableModels(signal),
  staleTime: 60 * 1000
})

/** Loads available models into modelStore. Keeps the last list on failure. */
export const client_fetchModelsAvailableV2 = async () => {
  try {
    return await queryClient.query(availableModelsQuery)
  } catch (err) {
    console.log(`Error: Unable to fetch available models from AI Horde`)
    console.log(err)
    return queryClient.getQueryData(availableModelsQuery.queryKey) ?? []
  }
}
