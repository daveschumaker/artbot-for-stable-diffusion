import { useQuery } from '@tanstack/react-query'
import { basePath } from 'BASE_PATH'
import AppSettings from 'app/_data-models/AppSettings'

const fetchServerWorkers = async (signal?: AbortSignal) => {
  const resp = await fetch(`${basePath}/api/worker-details`, { signal })
  if (!resp.ok) throw new Error(`Unable to fetch workers: ${resp.status}`)
  const { workers = [] } = (await resp.json()) || {}
  return workers.filter((worker: any) => worker.type === 'image')
}

/**
 * Details of the worker the user sends every job to (the useWorkerId
 * setting), or false. It only loads the worker list when one is set.
 */
const useWorkerDetails = () => {
  const useWorkerId = AppSettings.get('useWorkerId') || ''
  const useBlocklist = AppSettings.get('blockedWorkers')

  const { data } = useQuery({
    queryKey: ['artbot', 'worker-details'],
    queryFn: ({ signal }) => fetchServerWorkers(signal),
    enabled: Boolean(useWorkerId) && !useBlocklist,
    staleTime: 60 * 1000
  })

  const worker = data?.find((w: any) => w.id === useWorkerId)
  return [worker ?? false] as [object | false]
}

export default useWorkerDetails
