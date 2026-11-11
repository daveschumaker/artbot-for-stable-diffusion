import { queryOptions } from '@tanstack/react-query'
import { basePath } from 'BASE_PATH'
import { IModelsDetails } from '_types/artbot'
import { setModelDetails } from 'app/_store/modelStore'
import { clientHeader } from 'app/_utils/appUtils'
import { queryClient } from './queryClient'

const fetchModelDetails = async (signal?: AbortSignal) => {
  const res = await fetch(`${basePath}/api/models/details`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'Client-Agent': clientHeader()
    },
    signal
  })
  const { success, models } = await res.json()
  if (!success) throw new Error('Unable to parse model details.')

  // Keep the fields ArtBot uses, for image models only.
  const modelDetails: IModelsDetails = {}
  for (const model in models) {
    const {
      description,
      baseline,
      homepage,
      showcases,
      name,
      nsfw,
      style,
      trigger,
      type,
      version
    } = models[model]

    if (type === 'ckpt') {
      modelDetails[name] = {
        description,
        baseline,
        homepage,
        showcases,
        name,
        nsfw,
        style,
        trigger,
        type,
        version
      }
    }
  }

  setModelDetails(modelDetails)
  return modelDetails
}

/** Details for every image model, from the AI Horde. Updates modelStore. */
export const modelDetailsQuery = queryOptions({
  queryKey: ['artbot', 'models', 'details'],
  queryFn: ({ signal }) => fetchModelDetails(signal),
  staleTime: 60 * 1000
})

/** Loads model details into modelStore. Keeps the last details on failure. */
export const client_fetchModelDetailsV2 = async (): Promise<IModelsDetails> => {
  try {
    return await queryClient.query(modelDetailsQuery)
  } catch (err) {
    console.log(`Error: Unable to fetch available models from AI Horde`)
    console.log(err)
    return queryClient.getQueryData(modelDetailsQuery.queryKey) ?? {}
  }
}
