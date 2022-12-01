import { IWorker, setUserInfo, setWorkers } from '../store/userStore'
import { getApiHostServer, isAppActive } from '../utils/appUtils'

let isPending = false
export const fetchUserDetails = async (apikey: string) => {
  if (!apikey || isPending) {
    return
  }

  if (!isAppActive()) {
    return
  }

  isPending = true
  try {
    const res = await fetch(`${getApiHostServer()}/api/v2/find_user`, {
      headers: {
        apikey
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
          `${getApiHostServer()}/api/v2/workers/${worker_ids[idx]}`
        )
        const workerData = await workerRes.json()
        const {
          name,
          id,
          maintenance_mode,
          models,
          online,
          requests_fulfilled,
          team,
          uptime,
          performance
        } = workerData

        workerInfo[id] = {
          id,
          maintenance_mode,
          models,
          name,
          online,
          requests_fulfilled,
          team,
          uptime,
          performance
        }
      }

      setWorkers(workerInfo)
    }
  } catch (err) {
    console.log(`Warning: Unable to fetch user details. API offline?`)
  } finally {
    isPending = false
    return {
      success: true
    }
  }
}
