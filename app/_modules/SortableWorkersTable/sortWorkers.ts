import { HordeWorkerDetails } from '_types/horde'

// Keys of HordeWorkerDetails whose values are primitives that can be compared
type SortableHordeWorkerKeys = {
  [K in keyof HordeWorkerDetails]-?: HordeWorkerDetails[K] extends
    | string
    | number
    | boolean
    ? K
    : never
}[keyof HordeWorkerDetails]

export type WorkerSortKey = keyof HordeWorkerDetails | 'kph'
export type WorkerSortOrder = 'asc' | 'dsc'

export const kudosPerHour = (worker: HordeWorkerDetails) =>
  worker.uptime ? Math.floor(worker.kudos_rewards / (worker.uptime / 3600)) : 0

const sortValue = (worker: HordeWorkerDetails, sortBy: WorkerSortKey) => {
  if (sortBy === 'models') return worker.models.length
  if (sortBy === 'kph') return kudosPerHour(worker)
  return worker[sortBy as SortableHordeWorkerKeys]
}

// Returns a sorted copy. The list comes from fetchWorkers, which shares one
// cached array with every other page, so it must not be sorted in place.
export const sortWorkers = (
  workers: HordeWorkerDetails[],
  sortBy: WorkerSortKey,
  sortOrder: WorkerSortOrder
) =>
  [...workers].sort((a, b) => {
    const aValue = sortValue(a, sortBy)
    const bValue = sortValue(b, sortBy)

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })
