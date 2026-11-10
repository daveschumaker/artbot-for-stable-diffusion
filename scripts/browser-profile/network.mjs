import http from 'node:http'
import https from 'node:https'
import net from 'node:net'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { createHash, randomUUID, X509Certificate } from 'node:crypto'
import path from 'node:path'

export const ORIGIN = 'https://tinybots.net'
export const PROBE = '/__artbot_profile_lab__/probe'

async function listen(server) {
  const sockets = new Set()
  server.on('connection', (socket) => {
    sockets.add(socket)
    socket.on('error', () => socket.destroy())
    socket.on('close', () => sockets.delete(socket))
  })
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  return {
    port: server.address().port,
    close: () =>
      new Promise((resolve) => {
        server.close(resolve)
        for (const socket of sockets) socket.destroy()
      })
  }
}

// No system CA installation: only the launched browser accepts this key.
async function certificate(directory) {
  await mkdir(directory, { recursive: true, mode: 0o700 })
  const keyPath = path.join(directory, 'key.pem')
  const certPath = path.join(directory, 'cert.pem')
  try {
    await readFile(certPath)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    const config = path.join(directory, 'openssl.cnf')
    await writeFile(
      config,
      '[req]\ndistinguished_name=dn\nx509_extensions=ext\nprompt=no\n[dn]\nCN=tinybots.net\n[ext]\nsubjectAltName=DNS:tinybots.net\nbasicConstraints=critical,CA:FALSE\nkeyUsage=digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\n'
    )
    execFileSync(
      'openssl',
      [
        'req',
        '-x509',
        '-newkey',
        'rsa:2048',
        '-nodes',
        '-days',
        '365',
        '-config',
        config,
        '-keyout',
        keyPath,
        '-out',
        certPath
      ],
      { stdio: 'pipe' }
    )
  }
  const key = await readFile(keyPath)
  const cert = await readFile(certPath)
  const spki = createHash('sha256')
    .update(
      new X509Certificate(cert).publicKey.export({
        type: 'spki',
        format: 'der'
      })
    )
    .digest('base64')
  return { key, cert, spki }
}

export function localTarget(input) {
  const url = new URL(input)
  if (
    url.protocol !== 'http:' ||
    !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      'Target must be a loopback HTTP origin, e.g. http://127.0.0.1:3199'
    )
  }
  return url
}

// The HTTP CONNECT proxy is used by every browser network request, including
// service workers. No request ever falls through to production during replay.
export function liveHordeDestination(authority) {
  if (
    !/^(aihorde\.net|dev\.aihorde\.net|[a-z0-9.-]+\.r2\.cloudflarestorage\.com):443$/.test(
      authority
    )
  )
    return null
  return { host: authority.slice(0, -4), port: 443 }
}

export async function startReplayNetwork({
  certDir,
  target,
  liveHorde = false
}) {
  const upstream = target ? localTarget(target) : undefined
  const tls = await certificate(certDir)
  const nonce = randomUUID()
  const stats = { forwarded: 0, blocked: 0, liveHorde: 0 }
  const headers = (request) => ({
    ...request.headers,
    host: 'tinybots.net',
    'x-forwarded-host': 'tinybots.net',
    'x-forwarded-proto': 'https'
  })
  const gateway = https.createServer(tls, (request, response) => {
    if (request.headers.host !== 'tinybots.net') {
      response.writeHead(421).end()
      return
    }
    if (request.url.split('?')[0] === PROBE) {
      response.writeHead(200, {
        'content-type': 'text/html',
        'cache-control': 'no-store'
      })
      response.end(
        `<title>ArtBot profile lab</title><body data-nonce="${nonce}">Local profile lab. Production traffic is blocked.</body>`
      )
      return
    }
    if (!upstream) {
      response
        .writeHead(503)
        .end('Inspection mode: application requests are disabled.')
      return
    }
    stats.forwarded++
    const outgoing = http.request(
      upstream,
      { method: request.method, path: request.url, headers: headers(request) },
      (incoming) => {
        response.writeHead(incoming.statusCode, incoming.headers)
        incoming.pipe(response)
      }
    )
    outgoing.on('error', () => {
      if (!response.headersSent) response.writeHead(502)
      response.end(
        'Local ArtBot server is unavailable. No production fallback.'
      )
    })
    request.on('aborted', () => outgoing.destroy())
    request.pipe(outgoing)
  })
  // Next dev's HMR websocket must follow the same local path.
  gateway.on('upgrade', (request, socket, head) => {
    if (!upstream || request.headers.host !== 'tinybots.net')
      return socket.destroy()
    const outgoing = http.request(upstream, {
      method: request.method,
      path: request.url,
      headers: headers(request)
    })
    outgoing.on('upgrade', (response, peer, peerHead) => {
      socket.write(
        `HTTP/1.1 ${response.statusCode} ${response.statusMessage}\r\n${Object.entries(
          response.headers
        )
          .map(([k, v]) => `${k}: ${v}`)
          .join('\r\n')}\r\n\r\n`
      )
      if (head.length) peer.write(head)
      if (peerHead.length) socket.write(peerHead)
      socket.pipe(peer).pipe(socket)
      socket.on('close', () => peer.destroy())
      peer.on('error', () => socket.destroy())
      socket.on('error', () => peer.destroy())
    })
    outgoing.on('response', () => {
      outgoing.destroy()
      socket.destroy()
    })
    outgoing.on('error', () => socket.destroy())
    outgoing.end()
  })
  const gatewayHandle = await listen(gateway)
  const proxy = http.createServer((_request, response) => {
    stats.blocked++
    response
      .writeHead(403)
      .end('Replay permits only https://tinybots.net via the local server.')
  })
  proxy.on('connect', (request, client, head) => {
    const live = liveHorde ? liveHordeDestination(request.url) : null
    if (request.url !== 'tinybots.net:443' && !live) {
      stats.blocked++
      client.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n')
      return
    }
    if (live) stats.liveHorde++
    const peer = net.connect(
      live?.port ?? gatewayHandle.port,
      live?.host ?? '127.0.0.1',
      () => {
        client.write('HTTP/1.1 200 Connection Established\r\n\r\n')
        if (head.length) peer.write(head)
        client.pipe(peer).pipe(client)
      }
    )
    client.on('close', () => peer.destroy())
    peer.on('error', () => client.destroy())
    client.on('error', () => peer.destroy())
  })
  const proxyHandle = await listen(proxy)
  return {
    nonce,
    stats,
    launchOptions: {
      proxy: {
        server: `http://127.0.0.1:${proxyHandle.port}`,
        bypass: '<-loopback>'
      },
      args: [
        `--ignore-certificate-errors-spki-list=${tls.spki}`,
        '--disable-quic',
        '--force-webrtc-ip-handling-policy=disable_non_proxied_udp'
      ]
    },
    close: async () => {
      await proxyHandle.close()
      await gatewayHandle.close()
    }
  }
}

export async function openProbe(context, network) {
  const page = await context.newPage()
  await page.goto(`${ORIGIN}${PROBE}`, { waitUntil: 'domcontentloaded' })
  const proof = await page.evaluate(() => ({
    origin: location.origin,
    secure: isSecureContext,
    nonce: document.body.dataset.nonce
  }))
  if (
    proof.origin !== ORIGIN ||
    !proof.secure ||
    proof.nonce !== network.nonce
  ) {
    throw new Error('Local HTTPS/origin probe failed; refusing to open ArtBot.')
  }
  return page
}
