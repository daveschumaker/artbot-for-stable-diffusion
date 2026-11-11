import { isIP } from 'node:net'
import type { NextApiRequest } from 'next'

// Only the local reverse proxy can supply client identity. Public direct
// connections cannot choose another rate-limit bucket using request headers.
export const getClientAddress = (req: NextApiRequest) => {
  const peer = req.socket?.remoteAddress || 'unknown'
  if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(peer)) return peer
  // nginx must append $remote_addr with $proxy_add_x_forwarded_for. Ignore
  // X-Real-IP, which some proxy configurations pass through unchanged.
  const forwarded = req.headers['x-forwarded-for']
  const last =
    typeof forwarded === 'string'
      ? forwarded.split(',').at(-1)?.trim()
      : undefined
  return last && isIP(last) ? last : peer
}
