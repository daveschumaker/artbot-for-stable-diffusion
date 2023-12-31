import { setLoggedInState, setUserInfo } from 'app/_store/userStore'
import { clientHeader, getApiHostServer, isUuid } from 'app/_utils/appUtils'

interface UserCacheType {
  kudos?: number
  sharedKey: boolean
  username?: string
  records?: Record<string, unknown>
  trusted?: boolean
  worker_ids?: any // Specify actual type
  sharedkey_ids?: any[] // Specify actual type
  [key: string]: any // for additional unexpected fields
}

let userCache: UserCacheType | null = null
let lastFetchTime: number = 0
let isRequestInProgress: boolean = false

const MAX_RETRIES: number = 2
const RETRY_DELAY: number = 5000 // 5 seconds

// Define types for your API response here
type ApiResponse = Record<string, any>

// Fetch data from the API
const fetchData = async (
  url: string,
  headers: Record<string, string>
): Promise<ApiResponse> => {
  const response = await fetch(url, { headers })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return response.json()
}

// Retry logic
const retryFetch = async <T>(
  func: () => Promise<T>,
  maxRetries: number,
  delay: number
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await func()
    } catch (e) {
      console.log(
        `Retrying in ${delay / 1000} seconds... (Attempt ${
          i + 1
        } of ${maxRetries})`
      )
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw new Error('Max retries reached')
}

export const fetchUserDetailsV2 = async (
  apiKey: string,
  maxRetries: number = MAX_RETRIES
): Promise<UserCacheType | null> => {
  const currentTime: number = new Date().getTime()

  if (
    (currentTime - lastFetchTime < 30000 && userCache) ||
    isRequestInProgress
  ) {
    return userCache
  }

  if (!apiKey) {
    setLoggedInState(false)
    return null
  }

  const isSharedKey: boolean = isUuid(apiKey)
  const endpoint: string = isSharedKey
    ? `/api/v2/sharedkeys/${apiKey}`
    : `/api/v2/find_user`
  const headers: Record<string, string> = { 'Client-Agent': clientHeader() }
  if (!isSharedKey) headers['apikey'] = apiKey

  try {
    isRequestInProgress = true
    const data: ApiResponse = await retryFetch(
      () => fetchData(`${getApiHostServer()}${endpoint}`, headers),
      maxRetries,
      RETRY_DELAY
    )

    userCache = {
      ...data,
      sharedKey: isSharedKey
    }
    lastFetchTime = currentTime

    setLoggedInState(true)
    setUserInfo(userCache as any)

    return userCache
  } catch (err) {
    console.error(`Error: Unable to fetch user details from API: ${err}`)
    return null
  } finally {
    isRequestInProgress = false
  }
}
