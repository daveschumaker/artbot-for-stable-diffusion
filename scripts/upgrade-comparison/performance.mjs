// Paired desktop measurements of the deployed legacy and beta artifacts.
// Uses disposable profile copies, mocked service APIs and unchanged site assets.
import assert from 'node:assert/strict'
import http from 'node:http'
import https from 'node:https'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { chromium, expect } from '@playwright/test'
import {
  cloneBaseline,
  treeHash,
  waitForProfileExit
} from '../browser-profile/storage.mjs'
import { startReplayNetwork, ORIGIN } from '../browser-profile/network.mjs'

const repo = fileURLToPath(new URL('../../', import.meta.url))
const { values } = parseArgs({
  options: {
    rounds: { type: 'string', default: '3' },
    out: { type: 'string' },
    resume: { type: 'string' },
    'beta-build': { type: 'string', default: '202611111801' },
    'legacy-build': { type: 'string', default: '202508182305' },
    quick: { type: 'boolean', default: false },
    'legacy-origin': { type: 'string' },
    'beta-origin': { type: 'string' }
  }
})
// Optional local artifacts let the same paired protocol measure an optimization
// without deploying it. Both must be explicit loopback origins.
const local = !!(values['legacy-origin'] || values['beta-origin'])
if (local) {
  for (const key of ['legacy-origin', 'beta-origin'])
    assert.match(values[key] || '', /^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/)
}
const rounds = Number(values.rounds)
assert.ok(Number.isInteger(rounds) && rounds >= 1 && rounds <= 10)
for (const key of ['beta-build', 'legacy-build'])
  assert.match(values[key], /^\d{12}$/)
process.umask(0o077)
const out = path.resolve(
  values.out ||
    path.join(
      repo,
      '__local_db/upgrade-comparison',
      `performance-${Date.now()}`
    )
)
await mkdir(out, { recursive: true })
const root = path.join(repo, '__local_db/browser-profiles')
const lanes = [
  {
    name: 'legacy',
    basePath: local ? '/artbot-beta' : '/artbot',
    origin: values['legacy-origin'] || ORIGIN,
    expectedBuild: values['legacy-build']
  },
  {
    name: 'beta',
    basePath: '/artbot-beta',
    origin: values['beta-origin'] || ORIGIN,
    expectedBuild: values['beta-build']
  }
]
const report = {
  started: new Date().toISOString(),
  node: process.version,
  rounds,
  localArtifacts: local,
  viewport: { width: 1440, height: 1000 },
  networkThrottling: false,
  cpuThrottling: false,
  transport: local
    ? 'Paired local production artifacts through the isolated HTTPS profile gateway; legacy is the before artifact and beta is the candidate.'
    : 'Public HTTPS through a local read-only relay and isolated HTTPS profile gateway; asset bodies are unchanged and uncached by the relay.',
  limitations: [
    'Desktop lab samples, not field percentiles or iPhone measurements.',
    'Cold browser cache does not mean cold CDN or server cache.',
    'Service APIs are deterministic fixtures; their live latency is excluded.',
    'JS heap excludes native image/Blob memory. Process RSS includes native memory but sums shared resident pages and is not physical footprint.',
    'Observed long-task blocking is measured during this load window, not a Lighthouse score or field INP.'
  ],
  builds: {},
  http: [],
  samples: [],
  memoryCycles: [],
  baselineHashes: {},
  failures: []
}
const save = () =>
  writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2))
if (values.resume) {
  const previous = JSON.parse(await readFile(values.resume, 'utf8'))
  assert.equal(previous.rounds, rounds)
  assert.equal(previous.node, process.version)
  for (const key of [
    'http',
    'samples',
    'memoryCycles',
    'baselineHashes',
    'builds'
  ])
    report[key] = previous[key]
  report.resumedFrom = path.resolve(values.resume)
  report.previousFailures = previous.failures
  report.started = previous.started
}

// Do not forward credentials or permit writes, including from persisted tabs.
const relay = http.createServer((request, reply) => {
  const url = new URL(request.url, 'http://localhost')
  if (
    url.origin !== 'http://localhost' ||
    !['GET', 'HEAD'].includes(request.method) ||
    !lanes.some(
      (l) =>
        url.pathname === l.basePath || url.pathname.startsWith(l.basePath + '/')
    )
  ) {
    request.resume()
    reply.writeHead(403).end()
    return
  }
  const headers = { ...request.headers }
  for (const key of [
    'host',
    'cookie',
    'authorization',
    'apikey',
    'proxy-authorization'
  ])
    delete headers[key]
  const upstream = https.request(
    new URL(url.pathname + url.search, ORIGIN),
    { method: request.method, headers },
    (response) => {
      const headers = { ...response.headers }
      delete headers['set-cookie']
      reply.writeHead(response.statusCode, headers)
      response.pipe(reply)
    }
  )
  upstream.setTimeout(30000, () =>
    upstream.destroy(new Error('Public site timeout'))
  )
  upstream.on('error', () => {
    if (!reply.headersSent) reply.writeHead(502)
    reply.end()
  })
  request.on('aborted', () => upstream.destroy())
  upstream.end()
})
await new Promise((resolve, reject) => {
  relay.once('error', reject)
  relay.listen(0, '127.0.0.1', resolve)
})
const target = `http://127.0.0.1:${relay.address().port}`

async function httpSample(lane, route) {
  const started = performance.now()
  return new Promise((resolve, reject) => {
    const result = {
      lane: lane.name,
      route,
      connection: 'new TLS connection',
      bytes: 0
    }
    const transport = lane.origin.startsWith('http:') ? http : https
    result.connection = local
      ? 'new loopback HTTP connection'
      : 'new TLS connection'
    const request = transport.get(
      `${lane.origin}${lane.basePath}/${route}`,
      { agent: false, headers: { 'accept-encoding': 'gzip, br' } },
      (response) => {
        result.ttfbMs = performance.now() - started
        result.status = response.statusCode
        result.encoding = response.headers['content-encoding'] || 'identity'
        result.cacheControl = response.headers['cache-control'] || null
        response.on('data', (bytes) => {
          result.bytes += bytes.length
        })
        response.on('end', () =>
          resolve({ ...result, totalMs: performance.now() - started })
        )
      }
    )
    request.setTimeout(30000, () =>
      request.destroy(new Error('HTTP sample timeout'))
    )
    request.on('error', reject)
  })
}

async function installObservers(context) {
  await context.addInitScript(() => {
    performance.setResourceTimingBufferSize(10000)
    window.__artbotPerf = { lcp: 0, cls: 0, blockingMs: 0, longTasks: 0 }
    for (const [type, observe] of [
      [
        'largest-contentful-paint',
        (entries) => {
          window.__artbotPerf.lcp = entries.at(-1)?.startTime || 0
        }
      ],
      [
        'layout-shift',
        (entries) => {
          for (const e of entries)
            if (!e.hadRecentInput) window.__artbotPerf.cls += e.value
        }
      ],
      [
        'longtask',
        (entries) => {
          for (const e of entries) {
            window.__artbotPerf.blockingMs += Math.max(0, e.duration - 50)
            window.__artbotPerf.longTasks++
          }
        }
      ]
    ]) {
      try {
        new PerformanceObserver((list) => observe(list.getEntries())).observe({
          type,
          buffered: true
        })
      } catch {
        /* Unsupported metric stays zero. */
      }
    }
  })
}
async function mockReadServices(context, basePath) {
  // Fetch fixtures preserve native HTTP caching. Playwright request routing
  // disables it, even after Network.setCacheDisabled(false).
  await context.addInitScript(
    ({ basePath }) => {
      const original = window.fetch.bind(window)
      const names = [
        'AlbedoBase XL (SDXL)',
        'Deliberate',
        'Dreamshaper',
        'Realistic Vision',
        'DreamShaper Inpainting',
        'Anything Diffusion',
        'stable_diffusion',
        'Z-Image-Turbo'
      ]
      const json = (body) => Promise.resolve(Response.json(body))
      window.fetch = (input, init) => {
        const url = new URL(
          input instanceof Request ? input.url : String(input),
          location.href
        )
        if (
          url.hostname === 'tinybots.net' &&
          url.pathname.startsWith(basePath + '/api/') &&
          !url.pathname.endsWith('/server-info')
        ) {
          if (url.pathname.endsWith('/models/available'))
            return json({
              success: true,
              models: names.map((name) => ({
                name,
                count: 5,
                performance: 100000,
                queued: 0,
                eta: 5,
                type: 'image'
              }))
            })
          if (url.pathname.endsWith('/models/details'))
            return json({
              success: true,
              models: Object.fromEntries(
                names.map((name) => [
                  name,
                  {
                    name,
                    baseline: name.includes('XL')
                      ? 'stable_diffusion_xl'
                      : 'stable diffusion 1',
                    inpainting: name.includes('Inpainting'),
                    description: 'Performance fixture',
                    nsfw: false,
                    trigger: [],
                    type: 'ckpt',
                    version: '1'
                  }
                ])
              )
            })
          return json(
            url.pathname.includes('showcase') ? [] : { success: true }
          )
        }
        if (
          url.hostname === 'aihorde.net' ||
          url.hostname === 'dev.aihorde.net'
        ) {
          if (
            (init?.method ||
              (input instanceof Request && input.method) ||
              'GET') !== 'GET'
          )
            throw new Error('Performance tests never submit work')
          if (
            url.pathname.includes('/find_user') ||
            url.pathname.includes('/sharedkeys/')
          )
            return json({
              id: 1234,
              username: 'Performance fixture',
              kudos: 10000000,
              trusted: true,
              concurrency: 10,
              records: {},
              worker_ids: [],
              sharedkey_ids: []
            })
          if (url.pathname.endsWith('/workers')) return json([])
          return json({
            queued_requests: 0,
            queued_megapixelsteps: 0,
            worker_count: 10,
            thread_count: 10,
            past_minute_megapixelsteps: 1000
          })
        }
        return original(input, init)
      }
    },
    { basePath }
  )
}
async function memory(context, cdp) {
  await cdp.send('HeapProfiler.collectGarbage')
  const metrics = Object.fromEntries(
    (await cdp.send('Performance.getMetrics')).metrics.map((m) => [
      m.name,
      m.value
    ])
  )
  const dom = await cdp.send('Memory.getDOMCounters')
  const browserSession = await context.browser().newBrowserCDPSession()
  const processes = (await browserSession.send('SystemInfo.getProcessInfo'))
    .processInfo
  await browserSession.detach()
  const ids = processes.map((p) => p.id)
  const rss = new Map(
    execFileSync('ps', ['-o', 'pid=,rss=', '-p', ids.join(',')], {
      encoding: 'utf8'
    })
      .trim()
      .split('\n')
      .map((line) => line.trim().split(/\s+/).map(Number))
  )
  return {
    jsHeapBytes: metrics.JSHeapUsedSize,
    jsHeapTotalBytes: metrics.JSHeapTotalSize,
    processRssBytes: [...rss.values()].reduce((a, b) => a + b, 0) * 1024,
    rendererRssBytes:
      processes
        .filter((p) => p.type === 'renderer')
        .reduce((sum, p) => sum + (rss.get(p.id) || 0), 0) * 1024,
    dom,
    metrics
  }
}
async function ready(page, route, expectedRows) {
  await page.waitForFunction(() => !!window._artbotDb?.completed)
  if (route === 'create')
    await expect(page.getByPlaceholder('Describe your image')).toBeVisible()
  if (route === 'draw')
    await expect(page.locator('canvas').first()).toBeVisible()
  if (route.startsWith('settings'))
    await expect(
      page
        .getByText('Download database', { exact: true })
        .or(page.getByRole('button', { name: 'Prepare backup', exact: true }))
        .first()
    ).toBeVisible()
  if (route === 'images' && expectedRows) {
    await expect
      .poll(() => page.locator('a[href*="/image/"]').count(), {
        timeout: 30000
      })
      .toBeGreaterThan(0)
    await expect
      .poll(
        () =>
          page
            .locator('a[href*="/image/"] img')
            .first()
            .evaluate((img) => img.naturalWidth),
        { timeout: 30000 }
      )
      .toBeGreaterThan(0)
  }
}
async function sample(
  page,
  context,
  cdp,
  lane,
  scenario,
  cache,
  round,
  expectedRows
) {
  const started = performance.now()
  const response =
    cache === 'warm'
      ? await page.reload({ waitUntil: 'domcontentloaded' })
      : await page.goto(`${ORIGIN}${lane.basePath}/${scenario.route}`, {
          waitUntil: 'domcontentloaded'
        })
  assert.equal(response.status(), 200)
  await ready(page, scenario.route, expectedRows)
  const usableMs = performance.now() - started
  await page.waitForTimeout(1800)
  const timing = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0]
    const resources = performance
      .getEntriesByType('resource')
      .filter((r) => r.name.startsWith(location.origin))
    return {
      ttfbMs: navigation.responseStart - navigation.startTime,
      requestTtfbMs: navigation.responseStart - navigation.requestStart,
      domContentLoadedMs: navigation.domContentLoadedEventEnd,
      loadMs: navigation.loadEventEnd,
      fcpMs:
        performance.getEntriesByName('first-contentful-paint')[0]?.startTime ||
        null,
      ...window.__artbotPerf,
      html: {
        transferBytes: navigation.transferSize,
        encodedBytes: navigation.encodedBodySize,
        decodedBytes: navigation.decodedBodySize
      },
      resources: resources.map((r) => ({
        path: new URL(r.name).pathname,
        type: r.initiatorType,
        transferBytes: r.transferSize,
        encodedBytes: r.encodedBodySize,
        decodedBytes: r.decodedBodySize,
        durationMs: r.duration,
        protocol: r.nextHopProtocol
      }))
    }
  })
  const mem = await memory(context, cdp)
  return {
    lane: lane.name,
    scenario: scenario.name,
    route: scenario.route,
    round,
    cache,
    usableMs,
    ...timing,
    memory: mem
  }
}

async function run(lane, scenario, round) {
  const clone = await cloneBaseline(root, scenario.baseline)
  const network = await startReplayNetwork({
    certDir: path.join(root, 'tls'),
    target: local ? lane.origin : target
  })
  let context
  try {
    context = await chromium.launchPersistentContext(clone.profile, {
      channel: 'chromium',
      headless: true,
      viewport: report.viewport,
      ...network.launchOptions
    })
    report.browser = context.browser().version()
    await mockReadServices(context, lane.basePath)
    await installObservers(context)
    for (const page of context.pages()) await page.close()
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    const cdp = await context.newCDPSession(page)
    await cdp.send('Network.enable')
    await cdp.send('Network.clearBrowserCache')
    // Retain Resource Timing evidence so warm-cache claims are auditable.
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: false })
    await cdp.send('Performance.enable')
    report.samples.push(
      await sample(
        page,
        context,
        cdp,
        lane,
        scenario,
        'cold',
        round,
        scenario.rows
      )
    )
    report.samples.push(
      await sample(
        page,
        context,
        cdp,
        lane,
        scenario,
        'warm',
        round,
        scenario.rows
      )
    )
    assert.equal(
      await page.evaluate(() => window._artbotDb.completed.count()),
      scenario.rows
    )
    if (scenario.rows && round === 0) {
      const checkpoints = [{ cycle: 0, ...(await memory(context, cdp)) }]
      for (let cycle = 1; cycle <= 10; cycle++) {
        await page.locator(`a[href^="${lane.basePath}/image/"]`).first().click()
        await page.waitForTimeout(100)
        await page.keyboard.press('Escape')
        if (!(await page.locator(`a[href^="${lane.basePath}/image/"]`).count()))
          await page
            .locator(`a[href="${lane.basePath}/images"]`)
            .first()
            .click()
        await expect(
          page.locator(`a[href^="${lane.basePath}/image/"]`).first()
        ).toBeVisible()
        if (cycle % 2 === 0)
          checkpoints.push({ cycle, ...(await memory(context, cdp)) })
      }
      report.memoryCycles.push({
        lane: lane.name,
        scenario: scenario.name,
        checkpoints
      })
    }
    if (scenario.name === 'empty-create' && round === 0) {
      // Separate traced reload: trace overhead is excluded from sample medians.
      const tracing = await context.newCDPSession(page)
      await tracing.send('Tracing.start', {
        categories: 'devtools.timeline,v8,blink.user_timing,loading',
        transferMode: 'ReturnAsStream'
      })
      await page.reload({ waitUntil: 'networkidle' })
      const complete = new Promise((resolve) =>
        tracing.once('Tracing.tracingComplete', resolve)
      )
      await tracing.send('Tracing.end')
      const { stream } = await complete
      const chunks = []
      let eof = false
      while (!eof) {
        const chunk = await tracing.send('IO.read', { handle: stream })
        chunks.push(
          Buffer.from(chunk.data, chunk.base64Encoded ? 'base64' : 'utf8')
        )
        eof = chunk.eof
      }
      await tracing.send('IO.close', { handle: stream })
      await writeFile(
        path.join(out, `${lane.name}-create-trace.json`),
        Buffer.concat(chunks)
      )
      await tracing.detach()
    }
    assert.deepEqual(errors, [])
    console.log(
      JSON.stringify({
        lane: lane.name,
        scenario: scenario.name,
        round: round + 1,
        status: 'passed'
      })
    )
  } finally {
    await context?.close()
    await network.close()
    await waitForProfileExit(clone.profile)
    // Only this invocation's disposable clone is removed, never its baseline.
    await rm(clone.directory, {
      recursive: true,
      force: true,
      maxRetries: 10,
      retryDelay: 250
    })
    report.baselineHashes[scenario.baseline] = clone.manifest.profileSha256
    await save()
  }
}

try {
  for (const lane of lanes) {
    const info = await (
      await fetch(`${lane.origin}${lane.basePath}/api/server-info`)
    ).json()
    assert.equal(
      info.build,
      lane.expectedBuild,
      'Deployment changed during profiling'
    )
    if (report.builds[lane.name])
      assert.equal(
        report.builds[lane.name],
        info.build,
        'Cannot resume measurements from another deployment'
      )
    report.builds[lane.name] = info.build
  }
  const routes = values.quick
    ? ['create']
    : ['create', 'images', 'draw', 'settings?panel=import-export']
  for (let round = 0; round < rounds; round++)
    for (const route of routes)
      for (const lane of round % 2 ? [...lanes].reverse() : lanes)
        if (
          !report.http.some(
            (s) =>
              s.round === round && s.route === route && s.lane === lane.name
          )
        )
          report.http.push({ round, ...(await httpSample(lane, route)) })
  const scenarios = routes.map((route) => ({
    name: `empty-${route.split('?')[0]}`,
    route,
    baseline: 'production-new-user',
    rows: 0
  }))
  if (!values.quick)
    scenarios.push(
      {
        name: 'library-245',
        route: 'images',
        baseline: 'production-pagination-favorites',
        rows: 245
      },
      {
        name: 'library-1721',
        route: 'images',
        baseline: 'iphone-import-1721',
        rows: 1721
      }
    )
  for (let round = 0; round < rounds; round++)
    for (const scenario of scenarios)
      for (const lane of round % 2 ? [...lanes].reverse() : lanes)
        if (
          !['cold', 'warm'].every((cache) =>
            report.samples.some(
              (s) =>
                s.round === round &&
                s.scenario === scenario.name &&
                s.lane === lane.name &&
                s.cache === cache
            )
          )
        )
          await run(lane, scenario, round)
  for (const [name, hash] of Object.entries(report.baselineHashes))
    assert.equal(
      await treeHash(path.join(root, 'baselines', name, 'profile')),
      hash,
      'Sealed baseline changed'
    )
  report.status = 'passed'
} catch (error) {
  report.status = 'failed'
  report.failures.push(error.stack)
  process.exitCode = 1
} finally {
  relay.closeAllConnections()
  await new Promise((resolve) => relay.close(resolve))
  report.finished = new Date().toISOString()
  await save()
  console.log(`Performance ${report.status}: ${out}/report.json`)
}
