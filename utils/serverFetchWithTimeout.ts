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

    // @ts-ignore
    signal
  })
  clearTimeout(id)
  return response
}

export default serverFetchWithTimeout
