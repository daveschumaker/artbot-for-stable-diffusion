import { IWorker, setUserInfo, setWorkers } from '../store/userStore'
import { clientHeader, getApiHostServer, isAppActive } from '../utils/appUtils'

let isPending = false
export const fetchUserDetails = async (apikey: string) => {
  if (!apikey || isPending) {
    return { status: 'pending' }
  }

  if (!isAppActive()) {
    return { status: 'app inactive' }
  }

  isPending = true
  try {
    const res = await fetch(`${getApiHostServer()}/api/v2/find_user`, {
      headers: {
        apikey,
        'Client-Agent': clientHeader()
      }
    })
    const userDetails = await res.json()
    const {
      kudos = 0,
      trusted = false,
      username = '',
      worker_ids = null
    } = userDetails

    setUserInfo({
      kudos,
      trusted,
      username,
      worker_ids
    })

    if (worker_ids.length > 0) {
      let workerInfo: { [key: string]: IWorker } = {}

      for (const idx in worker_ids) {
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
      }

      setWorkers(workerInfo)
    }

    isPending = false
    return {
      success: true
    }
  } catch (err) {
    console.log(`Warning: Unable to fetch user details. API offline?`)
    isPending = false
    return {
      success: false
    }
  }
}
