'use client'

import { useQuery } from '@tanstack/react-query'
import { useStore } from 'statery'
import { availableModelsQuery } from 'app/_api/client_fetchModelsAvailableV2'
import { modelDetailsQuery } from 'app/_api/client_fetchModelDetailsV2'
import fetchMyWorkers from 'app/_api/fetchMyWorkers'
import { fetchUserDetailsV2 } from 'app/_api/fetchUserDetailsV2'
import { hordePerformanceQuery } from 'app/_api/horde/performance'
import AppSettings from 'app/_data-models/AppSettings'
import { useIsAppActive } from 'app/_hooks/useIsAppActive'
import { userInfoStore } from 'app/_store/userStore'

// How often app-wide data refreshes while ArtBot is active.
const REFRESH_MS = 60 * 1000

/**
 * Loads app-wide data on startup and refreshes it every minute while the
 * app is active: available models, model details, Horde performance, the
 * user's details and their workers. Each query updates its store, which
 * the rest of the app reads.
 */
export default function GlobalDataSync() {
  const active = useIsAppActive()
  const { loggedIn, worker_ids } = useStore(userInfoStore)
  const workerIds = worker_ids ?? []

  const refresh = {
    refetchInterval: active ? REFRESH_MS : false,
    // useIsAppActive decides, including for background primary windows.
    refetchIntervalInBackground: true
  } as const

  useQuery({ ...availableModelsQuery, ...refresh })
  useQuery({ ...modelDetailsQuery, ...refresh })
  useQuery({ ...hordePerformanceQuery, ...refresh })

  // These two drive refreshes of keyed queries that other code also uses.
  // Reading the API key when each refresh runs means a login or logout
  // after startup is picked up. Details fetched in the last 30 seconds,
  // such as by the login itself, are reused.
  useQuery({
    queryKey: ['artbot', 'sync', 'user'],
    queryFn: () => {
      const apiKey = AppSettings.get('apiKey')
      // During a login, loggedIn turns true before the key is saved. An
      // empty key would log the user out, so wait for the next refresh.
      return apiKey ? fetchUserDetailsV2(apiKey) : null
    },
    ...refresh,
    enabled: Boolean(loggedIn)
  })
  useQuery({
    queryKey: ['artbot', 'sync', 'my-workers', workerIds],
    queryFn: async () => {
      await fetchMyWorkers()
      return true
    },
    ...refresh,
    enabled: workerIds.length > 0
  })

  return null
}
