import { ClientRateLimit } from './clientRateLimit'

// URL import is an interactive tool; generation downloads go directly to R2.
const requests = new ClientRateLimit(30, 60 * 1000)
let active = 0
export const IMAGE_IMPORT_MAX_DIMENSION = 8192
export const IMAGE_IMPORT_MAX_PIXELS = 64 * 1024 * 1024
export function acquireImageImport(client: string) {
  if (active >= 2 || !requests.consume(client)) return undefined
  active++
  let released = false
  return () => {
    if (!released) {
      released = true
      active--
    }
  }
}
export const resetImageImportLimits = () => {
  requests.reset()
  active = 0
}
