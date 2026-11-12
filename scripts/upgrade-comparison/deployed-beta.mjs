// Serve the deployed beta's unchanged responses to isolated browser tests.
// Browser credentials are never forwarded. The only permitted POSTs are the
// existing negative URL-import tests; generation and telemetry remain mocked.
import assert from 'node:assert/strict'
import http from 'node:http'
import https from 'node:https'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile, readdir, cp } from 'node:fs/promises'
import { parseArgs } from 'node:util'

const repo = fileURLToPath(new URL('../../', import.meta.url))
const { values } = parseArgs({
  options: {
    port: { type: 'string', default: '34861' },
    build: { type: 'string' },
    out: { type: 'string' }
  }
})
assert.match(values.build || '', /^\d{12}$/, 'Specify the expected --build')
const port = Number(values.port)
assert.ok(Number.isInteger(port) && port >= 1024 && port <= 65535)
process.umask(0o077)
const out = path.resolve(
  values.out ||
    path.join(repo, '__local_db/upgrade-comparison', `beta-${Date.now()}`)
)
await mkdir(out, { recursive: true })
const upstream = 'https://tinybots.net'
const basePath = '/artbot-beta'
const response = await fetch(`${upstream}${basePath}/api/server-info`)
assert.equal(response.status, 200)
const info = await response.json()
assert.equal(info.build, values.build, 'Deployed beta build changed')
const report = {
  started: new Date().toISOString(),
  build: info.build,
  upstream: upstream + basePath,
  node: process.version,
  forwarded: 0,
  cacheHits: 0,
  blocked: 0,
  negativeImportPosts: 0,
  failures: [],
  assets: {},
  testCopies: []
}
const save = () =>
  writeFile(path.join(out, 'relay.json'), JSON.stringify(report, null, 2))
await cp(path.join(repo, 'e2e'), path.join(out, 'e2e'), { recursive: true })
for (const name of await readdir(path.join(out, 'e2e'))) {
  if (!name.endsWith('.ts')) continue
  const source = await readFile(path.join(repo, 'e2e', name), 'utf8')
  const transformed = source.replaceAll('/artbot', basePath)
  await writeFile(path.join(out, 'e2e', name), transformed)
  report.testCopies.push({
    name,
    originalSha256: createHash('sha256').update(source).digest('hex'),
    adaptedSha256: createHash('sha256').update(transformed).digest('hex')
  })
}
// Only test URLs/selectors change; application JS, CSS and HTML are untouched.
await writeFile(
  path.join(out, 'playwright.config.ts'),
  `import {defineConfig,devices} from '@playwright/test'
export default defineConfig({
 testDir:'./e2e', outputDir:process.env.BETA_OUTPUT || './artifacts',
 fullyParallel:true, workers:2, retries:0, forbidOnly:true, timeout:45000,
 reporter:[['list'],['json',{outputFile:process.env.BETA_REPORT || '${path.join(
   out,
   'e2e.json'
 )}'}]],
 use:{baseURL:'http://localhost:${port}',trace:'retain-on-failure'},
 projects:[
  {name:'chromium',use:{...devices['Desktop Chrome']}},
  {name:'firefox',grepInvert:/copying an image to the clipboard/,use:{...devices['Desktop Firefox']}},
  {name:'webkit',grepInvert:/copying an image to the clipboard/,use:{...devices['Desktop Safari']}}
 ]
})
`
)

const cache = new Map()
const allowedInvalidUrls = new Set([
  'http://localhost:3199/artbot-beta/create',
  'http://127.0.0.1:3199/artbot-beta/create',
  'http://169.254.169.254/latest/meta-data/',
  'file:///etc/passwd'
])
const forwardedHeaders = new Set([
  'accept',
  'content-type',
  'range',
  'rsc',
  'next-router-state-tree',
  'next-router-prefetch',
  'next-router-segment-prefetch',
  'next-url',
  'x-deployment-id',
  'x-middleware-subrequest'
])
const sockets = new Set()
const server = http.createServer(async (request, reply) => {
  const url = new URL(request.url, 'http://localhost')
  const block = () => {
    report.blocked++
    request.resume()
    reply.writeHead(403).end('Only the explicitly selected beta is available.')
  }
  if (
    url.origin !== 'http://localhost' ||
    !(url.pathname === basePath || url.pathname.startsWith(basePath + '/'))
  )
    return block()
  let body
  if (
    request.method === 'POST' &&
    url.pathname === basePath + '/api/img-from-url'
  ) {
    const chunks = []
    let length = 0
    for await (const chunk of request) {
      length += chunk.length
      if (length > 4096) return block()
      chunks.push(chunk)
    }
    body = Buffer.concat(chunks)
    let data
    try {
      data = JSON.parse(body.toString())
    } catch {
      return block()
    }
    if (
      !allowedInvalidUrls.has(data.imageUrl) ||
      Object.keys(data).length !== 1
    )
      return block()
    report.negativeImportPosts++
  } else if (!['GET', 'HEAD'].includes(request.method)) return block()
  const key = url.pathname + url.search
  if (request.method === 'GET' && cache.has(key)) {
    report.cacheHits++
    const hit = cache.get(key)
    reply.writeHead(hit.status, hit.headers).end(hit.body)
    return
  }
  const headers = Object.fromEntries(
    Object.entries(request.headers).filter(([key]) => forwardedHeaders.has(key))
  )
  if (body) headers['content-length'] = body.length
  report.forwarded++
  const outgoing = https.request(
    new URL(key, upstream),
    { method: request.method, headers },
    (incoming) => {
      const safeHeaders = { ...incoming.headers }
      delete safeHeaders['set-cookie']
      if (safeHeaders.location?.startsWith(upstream + basePath))
        safeHeaders.location = safeHeaders.location.slice(upstream.length)
      reply.writeHead(incoming.statusCode, safeHeaders)
      const chunks = []
      const isAsset =
        request.method === 'GET' && url.pathname.includes('/_next/static/')
      incoming.on('data', (chunk) => {
        if (isAsset) chunks.push(chunk)
        reply.write(chunk)
      })
      incoming.on('end', () => {
        reply.end()
        if (isAsset && incoming.statusCode === 200) {
          const bytes = Buffer.concat(chunks)
          cache.set(key, { status: 200, headers: safeHeaders, body: bytes })
          report.assets[url.pathname] = {
            bytes: bytes.length,
            sha256: createHash('sha256').update(bytes).digest('hex')
          }
        }
      })
      incoming.on('error', () => reply.destroy())
    }
  )
  outgoing.setTimeout(30000, () =>
    outgoing.destroy(new Error('Upstream timeout'))
  )
  outgoing.on('error', (error) => {
    report.failures.push({ path: url.pathname, error: error.message })
    if (!reply.headersSent) reply.writeHead(502)
    reply.end('Beta request failed; no production fallback.')
  })
  request.on('aborted', () => outgoing.destroy())
  outgoing.end(body)
})
server.on('connection', (socket) => {
  sockets.add(socket)
  socket.on('close', () => sockets.delete(socket))
})
await new Promise((resolve, reject) => {
  server.once('error', reject)
  server.listen(port, '127.0.0.1', resolve)
})
await save()
const interval = setInterval(() => save().catch(() => {}), 5000)
const close = async () => {
  clearInterval(interval)
  server.close()
  for (const socket of sockets) socket.destroy()
  report.finished = new Date().toISOString()
  await save()
}
process.once('SIGINT', close)
process.once('SIGTERM', close)
console.log(JSON.stringify({ ready: true, build: info.build, port, out }))
