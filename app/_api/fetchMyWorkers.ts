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
  info: worker.info,
  kudos_rewards: worker.kudos_rewards,
  lora: worker.lora,
  maintenance_mode: worker.maintenance_mode,
  max_pixels: worker.max_pixels,
  models: worker.models,
  name: worker.name,
  nsfw: worker.nsfw,
  online: worker.online,
  painting: worker.painting,
  performance: worker.performance,
  'post-processing': worker['post-processing'],
  requests_fulfilled: worker.requests_fulfilled,
  team: worker.team,
  threads: worker.threads,
  trusted: worker.trusted,
  uptime: worker.uptime
})

/**
 * Loads one worker. Returns null if the Horde no longer knows it, and
 * undefined if it couldn't be loaded right now.
 */
const loadWorker = async (id: string, fresh: boolean) => {
  const { queryKey } = workerQuery(id)
  if (fresh) {
    // A lookup already in flight started before the change being refreshed
    // for, and would return the old state.
    await queryClient.cancelQueries({ queryKey })
  }
  try {
    return await queryClient.query({
      ...workerQuery(id),
      ...(fresh ? { staleTime: 0 } : {})
    })
  } catch {
    return undefined
  }
}

/**
 * Loads the user's workers into userStore. It shares each worker's cached
 * query with the header menu and worker cards. Pass `fresh` after changing
 * a worker, so the result reflects the change.
 */
const fetchMyWorkers = async ({ fresh = false }: { fresh?: boolean } = {}) => {
  const { worker_ids, workers: previous = {} } = userInfoStore.state

  if (!worker_ids || worker_ids.length === 0) {
    return
  }

  const results = await Promise.all(
    worker_ids.map((id: string) => loadWorker(id, fresh))
  )

  const workers: IWorkers = {}
  worker_ids.forEach((id: string, i: number) => {
    const worker = results[i]
    if (worker) {
      workers[id] = toStoreWorker(worker)
    } else if (worker === undefined && previous[id]) {
      // The Horde couldn't be reached. Keep showing what we had.
      workers[id] = previous[id]
    }
    // null: the Horde no longer has this worker, so it's left out.
  })
  setWorkers(workers)
}

export default fetchMyWorkers
