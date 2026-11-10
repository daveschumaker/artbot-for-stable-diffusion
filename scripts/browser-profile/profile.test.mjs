import { test } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { chromium } from '@playwright/test'
import {
  startReplayNetwork,
  openProbe,
  ORIGIN,
  localTarget,
  liveHordeDestination
} from './network.mjs'
import { auditStorage } from './audit.mjs'
import {
  browserIdentity,
  saveBaseline,
  cloneBaseline,
  treeHash
} from './storage.mjs'

test('local targets cannot forward replay to production', () => {
  assert.throws(() => localTarget('https://tinybots.net'))
  assert.throws(() => localTarget('http://evil.test'))
  assert.throws(() => localTarget('http://localhost:3199/artbot'))
  assert.equal(localTarget('http://127.0.0.1:3199').port, '3199')
})

test('live generation permits only the Horde API and HTTPS R2 download hosts', () => {
  for (const host of [
    'aihorde.net',
    'dev.aihorde.net',
    'bucket.account.r2.cloudflarestorage.com'
  ])
    assert.deepEqual(liveHordeDestination(`${host}:443`), { host, port: 443 })
  for (const authority of [
    'tinybots.net:443',
    'example.com:443',
    'aihorde.net.evil.test:443',
    'evilaihorde.net:443',
    'aihorde.net:80',
    'bucket.r2.cloudflarestorage.com.evil.test:443',
    '127.0.0.1:443'
  ])
    assert.equal(liveHordeDestination(authority), null)
})

test(
  'closed profile clones preserve Blobs, counters, caches and workers at the production origin',
  { timeout: 120000 },
  async (t) => {
    const root = await mkdtemp(path.join(tmpdir(), 'artbot-profile-proof-'))
    const localRequests = []
    const server = http.createServer((req, res) => {
      localRequests.push({
        url: req.url,
        host: req.headers.host,
        proto: req.headers['x-forwarded-proto']
      })
      if (req.url === '/artbot/test-worker.js') {
        res.writeHead(200, {
          'content-type': 'application/javascript',
          'cache-control': 'no-store'
        })
        return res.end(
          "self.addEventListener('install',e=>e.waitUntil(self.skipWaiting())); self.addEventListener('activate',e=>e.waitUntil(self.clients.claim())); self.addEventListener('fetch',e=>{if(new URL(e.request.url).pathname==='/artbot/from-worker')e.respondWith(new Response('persisted worker'));});"
        )
      }
      res.writeHead(200, { 'content-type': 'text/html' })
      res.end('<title>Local test build</title><body>local build proof</body>')
    })
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    const network = await startReplayNetwork({
      certDir: path.join(root, 'tls'),
      target: `http://127.0.0.1:${server.address().port}`
    })
    const contexts = []
    try {
      const source = path.join(root, 'capture', 'profile')
      const first = await chromium.launchPersistentContext(source, {
        channel: 'chromium',
        headless: true,
        ...network.launchOptions
      })
      contexts.push(first)
      const page = await openProbe(first, network)
      t.diagnostic('Local TLS probe passed')
      await page.goto(`${ORIGIN}/artbot/`)
      assert.equal(await page.title(), 'Local test build')
      await page.evaluate(async () => {
        const req = indexedDB.open('imageHorde', 60)
        req.onupgradeneeded = () => {
          req.result
            .createObjectStore('images', { keyPath: 'id', autoIncrement: true })
            .createIndex('jobId', 'jobId', { unique: true })
        }
        await new Promise((resolve, reject) => {
          req.onerror = () => reject(req.error)
          req.onsuccess = () => {
            const db = req.result
            const tx = db.transaction('images', 'readwrite')
            const store = tx.objectStore('images')
            const bytes = Uint8Array.from(
              { length: 2 * 1024 * 1024 },
              (_, i) => i % 251
            )
            store.add({
              id: 1,
              jobId: 'blob-job',
              image: new Blob([bytes], { type: 'image/webp' }),
              nested: [new Blob(['nested']), new Uint8Array([0, 255, 42])],
              date: new Date('2020-01-01')
            })
            store.add({ id: 100, jobId: 'deleted' })
            store.delete(100)
            tx.oncomplete = () => {
              db.close()
              resolve()
            }
            tx.onerror = () => reject(tx.error)
          }
        })
        localStorage.setItem('profile-fixture', 'baseline')
        await (
          await caches.open('artbot-proof')
        ).put('/artbot/cached', new Response('cached bytes'))
        await navigator.serviceWorker.register('/artbot/test-worker.js', {
          scope: '/artbot/'
        })
        await navigator.serviceWorker.ready
      })
      const before = await auditStorage(page)
      t.diagnostic('Seeded and audited source profile')
      assert.equal(before.databases[0].stores[0].blobs, 2)
      assert.equal(before.databases[0].stores[0].blobBytes, 2 * 1024 * 1024 + 6)
      await assert.rejects(
        saveBaseline({ root, name: 'live', profile: source, browser: {} }),
        /SingletonLock|still uses this profile/
      )
      const identity = {
        ...(await browserIdentity()),
        version: first.browser().version()
      }
      await first.close()
      const manifest = await saveBaseline({
        root,
        name: 'proof',
        profile: source,
        browser: identity
      })
      t.diagnostic('Saved closed baseline')
      for (let scenario = 0; scenario < 2; scenario++) {
        const clone = await cloneBaseline(root, 'proof')
        const context = await chromium.launchPersistentContext(clone.profile, {
          channel: 'chromium',
          headless: true,
          ...network.launchOptions
        })
        contexts.push(context)
        const p = await openProbe(context, network)
        assert.deepEqual(await auditStorage(p), before)
        t.diagnostic(`Clone ${scenario} matches source audit`)
        const persisted = await p.evaluate(async () => {
          const cache = await caches.open('artbot-proof')
          const cached = await (await cache.match('/artbot/cached')).text()
          const req = indexedDB.open('imageHorde')
          const nextId = await new Promise((resolve, reject) => {
            req.onerror = () => reject(req.error)
            req.onsuccess = () => {
              const db = req.result
              const tx = db.transaction('images', 'readwrite')
              const add = tx.objectStore('images').add({ jobId: 'next' })
              tx.oncomplete = () => {
                db.close()
                resolve(add.result)
              }
              tx.onerror = () => reject(tx.error)
            }
          })
          return { cached, nextId }
        })
        assert.deepEqual(persisted, { cached: 'cached bytes', nextId: 101 })
        await p.goto(`${ORIGIN}/artbot/from-worker`)
        assert.equal(await p.locator('body').innerText(), 'persisted worker')
        assert.equal(
          await p.evaluate(async () => {
            try {
              await fetch('https://example.com/')
              return 'leaked'
            } catch {
              return 'blocked'
            }
          }),
          'blocked'
        )
        await context.close()
      }
      assert.ok(network.stats.blocked > 0)
      assert.ok(
        localRequests.some(
          (r) =>
            r.url === '/artbot/' &&
            r.host === 'tinybots.net' &&
            r.proto === 'https'
        )
      )
      assert.equal(
        await treeHash(path.join(root, 'baselines/proof/profile')),
        manifest.profileSha256
      )
      await assert.rejects(
        saveBaseline({
          root,
          name: 'proof',
          profile: source,
          browser: identity
        }),
        { code: 'EEXIST' }
      )
      const manifestPath = path.join(root, 'baselines/proof/manifest.json')
      const changed = JSON.parse(await readFile(manifestPath, 'utf8'))
      changed.browser.sha256 = 'wrong-browser'
      await writeFile(manifestPath, JSON.stringify(changed))
      await assert.rejects(cloneBaseline(root, 'proof'), /mismatch/)
      await writeFile(manifestPath, JSON.stringify(manifest))
      await writeFile(
        path.join(root, 'baselines/proof/profile/tamper'),
        'changed'
      )
      await assert.rejects(cloneBaseline(root, 'proof'), /mutated/)
    } finally {
      for (const context of contexts) await context.close()
      await network.close()
      await new Promise((resolve) => server.close(resolve))
      await rm(root, { recursive: true, force: true })
    }
  }
)
