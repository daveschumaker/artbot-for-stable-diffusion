import { AbortController } from 'node-abort-controller'

interface IOptions {
  timeout?: number
  method?: string
  body?: string
  headers?: any
}

async function serverFetchWithTimeout(
  resource: string,
  options: IOptions = {}
) {
  const { timeout = 20000 } = options

  const controller = new AbortController()
  const { signal } = controller
  const id = setTimeout(() => controller.abort(), timeout)
  const response = await fetch(resource, {
    ...options,

    // node-abort-controller's signal is a polyfill, not the DOM AbortSignal
    // that fetch's typings expect. Node's fetch accepts it because it only
    // checks for `aborted` and `addEventListener`.
    signal: signal as unknown as AbortSignal
  })
  clearTimeout(id)
  return response
}

export default serverFetchWithTimeout
