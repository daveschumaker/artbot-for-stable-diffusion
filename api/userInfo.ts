import AppSettings from '../models/AppSettings'
import { setHordeStatus } from '../store/appStore'
import {
  IWorker,
  setLoggedInState,
  setUserInfo,
  setWorkers,
  userInfoStore
} from '../store/userStore'
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
  if (!apikey) {
    setLoggedInState(false)
    return {
      success: false
    }
  }

  if (isPending) {
    setLoggedInState(null)
    return { status: 'pending' }
  }

  if (!isAppActive()) {
    return { status: 'app inactive' }
  }

  isPending = true

  if (!userInfoStore.state.loggedIn) {
    setLoggedInState(null)
  }

  try {
    const res = await fetch(`${getApiHostServer()}/api/v2/find_user`, {
      headers: {
        apikey,
        'Client-Agent': clientHeader()
      }
    })

    const userDetails = await res.json()

    let {
      records = {},
      kudos = 0,
      kudos_details = {},
      trusted = false,
      username = '',
      worker_ids = null,
      sharedKey = false
    } = userDetails

    // FIXME: Hacky lookup for shared keys!
    if (userDetails.username.includes('(Shared Key:')) {
      const keyRes = await fetch(
        `${getApiHostServer()}/api/v2/sharedkeys/${apikey}`,
        {
          headers: {
            'Client-Agent': clientHeader()
          }
        }
      )

      const sharedKeyDetails = await keyRes.json()

      if (sharedKeyDetails.id) {
        sharedKey = true
        kudos = sharedKeyDetails.kudos
        username = sharedKeyDetails.username
      }
    }

    setUserInfo({
      kudos,
      //@ts-ignore
      kudos_details,
      records,
      trusted,
      username,
      sharedKey,
      worker_ids
    })

    if (worker_ids && worker_ids.length > 0) {
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
    // setHordeStatus(false) // TODO: Re-visit this and use heartbeat
    return {
      success: false
    }
  }
}
