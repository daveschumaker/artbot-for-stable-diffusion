import { setTrustedUser } from '../store/appStore'

let isPending = false
export const fetchUserDetails = async (apikey: string) => {
  if (!apikey || isPending) {
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
    const { trusted } = userDetails

    if (trusted) {
      setTrustedUser(true)
    } else {
      setTrustedUser(false)
    }
  } catch (err) {
    // Ah well.
  }

  isPending = false
  return {
    success: true
  }
}
