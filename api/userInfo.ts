import { setUserInfo } from '../store/userStore'
import { isAppActive } from '../utils/appUtils'

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
    const res = await fetch(`https://stablehorde.net/api/v2/find_user`, {
      headers: {
        apikey
      }
    })
    const userDetails = await res.json()
    const { kudos = 0, trusted = false, username = '' } = userDetails

    setUserInfo({
      kudos,
      trusted,
      username
    })
  } catch (err) {
    console.log(`Warning: Unable to fetch user details. API offline?`)
  } finally {
    isPending = false
    return {
      success: true
    }
  }
}
