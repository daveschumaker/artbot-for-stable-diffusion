import { useInfiniteQuery } from '@tanstack/react-query'
import {
  CivitaiSearchKind,
  CivitaiSearchParams,
  searchCivitai
} from 'app/_api/civitai/searchCivitai'
import { useDebouncedValue } from './useDebouncedValue'
import type { Embedding } from '_types/civitai'

const TYPING_DELAY_MS = 500
// The old hand-built cache kept searches for 20 minutes.
const CACHE_MS = 20 * 60 * 1000

/**
 * Searches CivitAI for LoRAs or embeddings. Each combination of text and
 * filters is cached, so repeating a search or reopening the modal reuses it.
 * Typing is debounced, and only the newest search's results are shown.
 */
export function useCivitaiSearch(
  kind: CivitaiSearchKind,
  params: CivitaiSearchParams,
  { requireInput = false }: { requireInput?: boolean } = {}
) {
  const typed = params.input.trim()
  const input = useDebouncedValue(typed, TYPING_DELAY_MS)
  const search = { ...params, input }
  const enabled = !requireInput || input.length > 0
  const settling = input !== typed && (!requireInput || typed.length > 0)

  const query = useInfiniteQuery({
    queryKey: ['civitai', kind, search],
    queryFn: ({ pageParam, signal }) =>
      searchCivitai(kind, search, { cursor: pageParam, signal }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor,
    enabled,
    staleTime: CACHE_MS,
    gcTime: CACHE_MS
  })

  // Cursor pages can overlap when results shift between requests.
  const seen = new Set<Embedding['id']>()
  const items: Embedding[] = []
  for (const page of query.data?.pages ?? []) {
    for (const item of page.items) {
      if (!seen.has(item.id)) {
        seen.add(item.id)
        items.push(item)
      }
    }
  }

  return {
    items,
    enabled,
    // Waiting for typing to settle counts as searching. A disabled query
    // also reports isPending, so only count it when the search can run.
    isSearching: settling || (enabled && query.isPending),
    isError: query.isError,
    hasMore: query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
    loadMore: () => query.fetchNextPage()
  }
}
