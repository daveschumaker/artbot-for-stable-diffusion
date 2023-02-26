import AppSettings from '../models/AppSettings'
import { setHordeStatus } from '../store/appStore'
import { IWorker, setUserInfo, setWorkers } from '../store/userStore'
import { clientHeader, getApiHostServer, isAppActive } from '../utils/appUtils'
import { uuidv4 } from '../utils/appUtils'

export const setUserId = () => {
  const artbot_uuid = AppSettings.get('artbot_uuid')

  if (artbot_uuid) {
    return
  }

  AppSettings.set('artbot_uuid', uuidv4())
}

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
      records = {},
      kudos = 0,
      kudos_details = {},
      trusted = false,
      username = '',
      worker_ids = null
    } = userDetails

    setUserInfo({
      kudos,
      //@ts-ignore
      kudos_details,
      records,
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
    setHordeStatus(true)
    return {
      success: true
    }
  } catch (err) {
    console.log(`Warning: Unable to fetch user details. API offline?`)
    isPending = false
    setHordeStatus(false)
    return {
      success: false
    }
  }
}
