import { queryOptions } from '@tanstack/react-query'
import { setLoggedInState, setUserInfo } from 'app/_store/userStore'
import { clientHeader, getApiHostServer, isUuid } from 'app/_utils/appUtils'
import { queryClient } from './queryClient'

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

const MAX_RETRIES: number = 2
const RETRY_DELAY: number = 5000 // 5 seconds

const fetchUser = async (
  apiKey: string,
  signal?: AbortSignal
): Promise<UserCacheType> => {
  const isSharedKey: boolean = isUuid(apiKey)
  const endpoint: string = isSharedKey
    ? `/api/v2/sharedkeys/${apiKey}`
    : `/api/v2/find_user`
  const headers: Record<string, string> = { 'Client-Agent': clientHeader() }
  if (!isSharedKey) headers['apikey'] = apiKey

  const response = await fetch(`${getApiHostServer()}${endpoint}`, {
    headers,
    signal
  })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  const data = await response.json()

  const user = { ...data, sharedKey: isSharedKey }
  setLoggedInState(true)
  setUserInfo(user as any)
  return user
}

// Query keys are kept in memory and show up in debugging tools, so they
// identify the key by a short hash rather than holding the key itself.
const keyHash = (apiKey: string) => {
  let hash = 2166136261
  for (let i = 0; i < apiKey.length; i++) {
    hash = Math.imul(hash ^ apiKey.charCodeAt(i), 16777619)
  }
  return (hash >>> 0).toString(36)
}

/** The AI Horde user (or shared key) for an API key. Updates userStore. */
const userDetailsQuery = (apiKey: string) =>
  queryOptions({
    queryKey: ['horde', 'user', keyHash(apiKey)],
    queryFn: ({ signal }) => fetchUser(apiKey, signal),
    staleTime: 30 * 1000,
    retry: MAX_RETRIES - 1,
    retryDelay: RETRY_DELAY
  })

/**
 * Loads the user's details into userStore and returns them. Uses details
 * from the last 30 seconds unless `fresh` is set, for example after
 * creating a shared key. Returns null if the Horde can't be reached, keeping
 * the user information already loaded.
 */
export const fetchUserDetailsV2 = async (
  apiKey: string,
  maxRetries: number = MAX_RETRIES,
  { fresh = false }: { fresh?: boolean } = {}
): Promise<UserCacheType | null> => {
  if (!apiKey) {
    setLoggedInState(false)
    return null
  }

  if (fresh) {
    // A lookup already in flight started before the change being refreshed
    // for, and would return the old details.
    await queryClient.cancelQueries({
      queryKey: userDetailsQuery(apiKey).queryKey
    })
  }

  try {
    return await queryClient.query({
      ...userDetailsQuery(apiKey),
      retry: maxRetries - 1,
      ...(fresh ? { staleTime: 0 } : {})
    })
  } catch {
    // Network outages (including isolated profile replay) are recoverable.
    // Keep existing user state and retry on the next scheduled refresh. Avoid
    // logging request URLs/headers, which can contain a user's API/shared key.
    console.warn(
      'Unable to refresh AI Horde user details; keeping existing user information.'
    )
    return null
  }
}
