import { HordeWorkerDetails } from '_types/horde'
import { workerQuery } from 'app/_api/horde/workers'
import {
  IWorker,
  IWorkers,
  setWorkers,
  userInfoStore
} from 'app/_store/userStore'
import { queryClient } from './queryClient'

// The fields the worker settings panel and menus read.
const toStoreWorker = (worker: HordeWorkerDetails): IWorker => ({
  id: worker.id,
  kudos_rewards: worker.kudos_rewards,
  maintenance_mode: worker.maintenance_mode,
  max_pixels: worker.max_pixels,
  models: worker.models,
  name: worker.name,
  online: worker.online,
  performance: worker.performance,
  requests_fulfilled: worker.requests_fulfilled,
  team: worker.team,
  threads: worker.threads,
  trusted: worker.trusted,
  uptime: worker.uptime
})

/**
 * Loads the user's workers into userStore. It shares each worker's cached
 * query with the header menu and worker cards. Pass `fresh` after changing
 * a worker, so the result reflects the change.
 */
const fetchMyWorkers = async ({ fresh = false }: { fresh?: boolean } = {}) => {
  const { worker_ids } = userInfoStore.state

  if (!worker_ids || worker_ids.length === 0) {
    return
  }

  const results = await Promise.all(
    worker_ids.map((id: string) =>
      queryClient
        .query({ ...workerQuery(id), ...(fresh ? { staleTime: 0 } : {}) })
        // A worker that fails to load is left out, as before.
        .catch(() => null)
    )
  )

  const workers: IWorkers = {}
  for (const worker of results) {
    if (worker) workers[worker.id] = toStoreWorker(worker)
  }
  setWorkers(workers)
}

export default fetchMyWorkers
