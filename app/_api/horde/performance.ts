import { queryOptions } from '@tanstack/react-query'
import { setHordePerformance } from 'app/_store/appStore'
import { clientHeader } from 'app/_utils/appUtils'

export interface HordePerformance {
  queued_requests: number
  queued_megapixelsteps: number
  past_minute_megapixelsteps: number
  worker_count: number
  thread_count: number
  queued_forms?: number
  interrogator_count?: number
  interrogator_thread_count?: number
}

const fetchHordePerformance = async (
  signal?: AbortSignal
): Promise<HordePerformance> => {
  const res = await fetch('https://aihorde.net/api/v2/status/performance', {
    headers: {
      'Content-Type': 'application/json',
      'Client-Agent': clientHeader()
    },
    signal
  })
  if (!res.ok) throw new Error(`Unable to fetch performance: ${res.status}`)
  const performance = await res.json()
  // The header and other store readers show the same numbers.
  setHordePerformance(performance)
  return performance
}

/** The AI Horde's queue and worker totals. Updates appInfoStore. */
export const hordePerformanceQuery = queryOptions({
  queryKey: ['horde', 'performance'],
  queryFn: ({ signal }) => fetchHordePerformance(signal),
  staleTime: 60 * 1000
})
