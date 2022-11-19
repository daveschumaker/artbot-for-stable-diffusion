import { setUserInfo } from '../store/userStore'

let isPending = false
export const fetchUserDetails = async (apikey: string) => {
  if (!apikey || isPending) {
    return
  }

  if (document.visibilityState !== 'visible') {
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
  } finally {
    isPending = false
    return {
      success: true
    }
  }
}
