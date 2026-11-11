import { useMemo } from 'react'
import { QueryClient, queryOptions, useQuery } from '@tanstack/react-query'
import { SelectOption } from '_types/artbot'
import { HordeWorkerDetails } from '_types/horde'
import { clientHeader, getApiHostServer } from 'app/_utils/appUtils'

/** Every image worker on the AI Horde. Throws if the Horde can't be reached. */
const fetchImageWorkers = async (
  signal?: AbortSignal
): Promise<HordeWorkerDetails[]> => {
  const res = await fetch(`${getApiHostServer()}/api/v2/workers`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'Client-Agent': clientHeader()
    },
    signal
  })
  if (!res.ok) throw new Error(`Unable to fetch workers: ${res.status}`)

  const data = await res.json()
  if (!Array.isArray(data)) throw new Error('Unexpected workers response')
  return data.filter((worker) => worker.type === 'image')
}

export const imageWorkersQuery = queryOptions({
  queryKey: ['horde', 'workers'],
  queryFn: ({ signal }) => fetchImageWorkers(signal),
  // The worker list changes slowly. This matches the old one-minute cache.
  staleTime: 60 * 1000
})

/**
 * Every image worker on the AI Horde. Components share one cached copy, so
 * sort or filter a copy of `data`, never the array itself.
 */
export const useImageWorkers = () => useQuery(imageWorkersQuery)

/** Workers as select options, sorted by name. */
export const useImageWorkerOptions = (): SelectOption[] => {
  const { data } = useImageWorkers()
  return useMemo(
    () =>
      (data ?? [])
        .map((worker) => ({ label: worker.name, value: worker.id }))
        .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0)),
    [data]
  )
}

/** One worker by id, or null if the Horde doesn't know it. */
const fetchWorker = async (
  id: string,
  signal?: AbortSignal
): Promise<HordeWorkerDetails | null> => {
  const res = await fetch(`${getApiHostServer()}/api/v2/workers/${id}`, {
    cache: 'no-store',
    signal
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Unable to fetch worker: ${res.status}`)
  return res.json()
}

export const workerQuery = (id: string) =>
  queryOptions({
    queryKey: ['horde', 'worker', id],
    queryFn: ({ signal }) => fetchWorker(id, signal),
    staleTime: 30 * 1000
  })

const fetchTeams = async (signal?: AbortSignal): Promise<SelectOption[]> => {
  const res = await fetch(`${getApiHostServer()}/api/v2/teams`, {
    cache: 'no-store',
    signal
  })
  if (!res.ok) throw new Error(`Unable to fetch teams: ${res.status}`)
  const teams = await res.json()
  if (!Array.isArray(teams)) throw new Error('Unexpected teams response')

  const options = teams
    .map((team) => ({ label: team.name, value: team.id }))
    .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0))
  return [{ label: 'None', value: null }, ...options]
}

/** Horde teams as select options, with "None" first. */
export const teamsQuery = queryOptions({
  queryKey: ['horde', 'teams'],
  queryFn: ({ signal }) => fetchTeams(signal),
  staleTime: 10 * 60 * 1000
})

/** Marks cached worker data stale after a worker is changed or deleted. */
export const invalidateWorker = (queryClient: QueryClient, id: string) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: ['horde', 'worker', id] }),
    queryClient.invalidateQueries({ queryKey: ['horde', 'workers'] })
  ])
