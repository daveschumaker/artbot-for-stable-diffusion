import { IWorker, setWorkers, userInfoStore } from '../store/userStore'
import { clientHeader, getApiHostServer } from '../utils/appUtils'
const fetchMyWorkers = async () => {
  const { worker_ids } = userInfoStore.state

  if (!worker_ids || worker_ids.length === 0) {
    return
  }

  let workerInfo: { [key: string]: IWorker } = {}
  for (const idx in worker_ids) {
    try {
      const workerRes = await fetch(
        `${getApiHostServer()}/api/v2/workers/${worker_ids[idx]}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Client-Agent': clientHeader()
          }
        }
      )

      const workerData = await workerRes.json()

      const {
        id,
        kudos_rewards,
        maintenance_mode,
        max_pixels,
        models,
        name,
        online,
        performance,
        requests_fulfilled,
        team,
        threads,
        trusted,
        uptime
      } = workerData

      workerInfo[id] = {
        id,
        kudos_rewards,
        maintenance_mode,
        max_pixels,
        models,
        name,
        online,
        performance,
        requests_fulfilled,
        team,
        threads,
        trusted,
        uptime
      }

      setWorkers(workerInfo)
    } catch (err) {
      // Ignore if error occurs
    }
  }
}

export default fetchMyWorkers
