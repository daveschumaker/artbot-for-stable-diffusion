import AppSettings from 'app/_data-models/AppSettings'
import { setHordeStatus } from 'app/_store/appStore'
import {
  setLoggedInState,
  setUserInfo,
  userInfoStore
} from 'app/_store/userStore'
import {
  clientHeader,
  getApiHostServer,
  isAppActive,
  isUuid
} from 'app/_utils/appUtils'
import { uuidv4 } from 'app/_utils/appUtils'

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
      sharedkey_ids = []
    } = userDetails

    if (isUuid(apikey)) {
      try {
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
          kudos = sharedKeyDetails.kudos
          username = sharedKeyDetails.username
        }
      } catch (err) {
        console.log(
          `Error: Something happened while trying to look up Shared Key details`
        )
        console.log(err)
      }
    }

    setUserInfo({
      kudos,
      //@ts-ignore
      kudos_details,
      records,
      trusted,
      username,
      sharedKey: isUuid(apikey),
      worker_ids,
      sharedkey_ids
    })

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
