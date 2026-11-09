import dns from 'dns'
import http from 'http'
import https from 'https'
import net from 'net'

type RemoteImageErrorCode =
  | 'INVALID_URL'
  | 'BLOCKED_ADDRESS'
  | 'TOO_LARGE'
  | 'FETCH_FAILED'

export class RemoteImageError extends Error {
  code: RemoteImageErrorCode

  constructor(code: RemoteImageErrorCode) {
    super(code)
    this.code = code
  }
}

interface FetchOptions {
  maxBytes: number
  isAllowedAddress?: (address: string) => boolean
}

const MAX_REDIRECTS = 3
const SOCKET_TIMEOUT_MS = 10000
const TOTAL_TIMEOUT_MS = 30000

const blockedAddresses = new net.BlockList()

const BLOCKED_IPV4_SUBNETS: Array<[string, number]> = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4]
]

const BLOCKED_IPV6_SUBNETS: Array<[string, number]> = [
  ['::', 128],
  ['::1', 128],
  ['64:ff9b::', 96],
  ['2001:db8::', 32],
  ['2002::', 16],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8]
]

BLOCKED_IPV4_SUBNETS.forEach(([address, prefix]) =>
  blockedAddresses.addSubnet(address, prefix, 'ipv4')
)
BLOCKED_IPV6_SUBNETS.forEach(([address, prefix]) =>
  blockedAddresses.addSubnet(address, prefix, 'ipv6')
)

// IPv4-mapped IPv6 addresses (::ffff:127.0.0.1) are checked against the IPv4 rules.
export const isPublicAddress = (address: string) => {
  const version = net.isIP(address)

  if (version === 0) {
    return false
  }

  return !blockedAddresses.check(address, version === 4 ? 'ipv4' : 'ipv6')
}

const parseUrl = (value: unknown) => {
  if (typeof value !== 'string') {
    throw new RemoteImageError('INVALID_URL')
  }

  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new RemoteImageError('INVALID_URL')
  }

  if (!['http:', 'https:'].includes(url.protocol) || url.username) {
    throw new RemoteImageError('INVALID_URL')
  }

  return url
}

// Checking the address as the connection is made means a hostname can't pass
// a check and then resolve somewhere else (DNS rebinding).
const createLookup =
  (isAllowed: (address: string) => boolean) =>
  (hostname: string, options: any, callback: any) => {
    dns.lookup(hostname, options, (error, address: any, family) => {
      if (error) {
        return callback(error)
      }

      const addresses = Array.isArray(address) ? address : [{ address }]

      if (addresses.some((entry) => !isAllowed(entry.address))) {
        return callback(new RemoteImageError('BLOCKED_ADDRESS'))
      }

      callback(null, address, family)
    })
  }

const download = (
  url: URL,
  { maxBytes, isAllowedAddress = isPublicAddress }: FetchOptions,
  redirectsLeft: number
): Promise<{ body: Buffer; contentType: string | null }> =>
  new Promise((resolve, reject) => {
    // Literal IP addresses skip the DNS lookup, so they're checked here.
    const hostname = url.hostname.replace(/^\[|\]$/g, '')
    if (net.isIP(hostname) && !isAllowedAddress(hostname)) {
      return reject(new RemoteImageError('BLOCKED_ADDRESS'))
    }

    const client = url.protocol === 'https:' ? https : http
    const request = client.get(url, {
      agent: false,
      headers: { accept: 'image/*', 'user-agent': 'ArtBot image import' },
      lookup: createLookup(isAllowedAddress) as any,
      timeout: SOCKET_TIMEOUT_MS
    })

    const fail = (error: unknown) => {
      clearTimeout(deadline)
      request.destroy()
      reject(
        error instanceof RemoteImageError
          ? error
          : new RemoteImageError('FETCH_FAILED')
      )
    }

    const deadline = setTimeout(
      () => fail(new RemoteImageError('FETCH_FAILED')),
      TOTAL_TIMEOUT_MS
    )

    request.on('timeout', () => fail(new RemoteImageError('FETCH_FAILED')))
    request.on('error', fail)

    request.on('response', (response) => {
      const status = response.statusCode ?? 0

      if (status >= 300 && status < 400 && response.headers.location) {
        clearTimeout(deadline)
        request.destroy()

        if (redirectsLeft === 0) {
          return reject(new RemoteImageError('FETCH_FAILED'))
        }

        try {
          const next = parseUrl(
            new URL(response.headers.location, url).toString()
          )
          return resolve(
            download(next, { maxBytes, isAllowedAddress }, redirectsLeft - 1)
          )
        } catch (error) {
          return reject(error)
        }
      }

      if (status < 200 || status >= 300) {
        return fail(new RemoteImageError('FETCH_FAILED'))
      }

      if (Number(response.headers['content-length']) > maxBytes) {
        return fail(new RemoteImageError('TOO_LARGE'))
      }

      const chunks: Buffer[] = []
      let received = 0

      response.on('data', (chunk: Buffer) => {
        received += chunk.length

        // A server can omit or lie about Content-Length.
        if (received > maxBytes) {
          return fail(new RemoteImageError('TOO_LARGE'))
        }

        chunks.push(chunk)
      })
      response.on('error', fail)
      response.on('end', () => {
        clearTimeout(deadline)
        resolve({
          body: Buffer.concat(chunks),
          contentType: response.headers['content-type'] ?? null
        })
      })
    })
  })

export const fetchRemoteImage = (value: unknown, options: FetchOptions) =>
  new Promise<{ body: Buffer; contentType: string | null }>(
    (resolve, reject) => {
      try {
        resolve(download(parseUrl(value), options, MAX_REDIRECTS))
      } catch (error) {
        reject(error)
      }
    }
  )
