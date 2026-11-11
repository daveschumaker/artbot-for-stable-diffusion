import { QueryClient } from '@tanstack/react-query'

/**
 * The app's one React Query client. QueryProvider gives it to components,
 * and non-React code imports it to refresh data, for example after pausing
 * a worker.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data that should stay fresh sets its own refetchInterval. Refetching
      // every query whenever the window regains focus would mean a burst of
      // Horde and CivitAI requests on every tab switch.
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})
