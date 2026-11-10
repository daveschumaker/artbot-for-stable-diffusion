#!/usr/bin/env node
import { chromium } from '@playwright/test'
import {
  mkdir,
  readFile,
  writeFile,
  readdir,
  access,
  cp
} from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { once } from 'node:events'
import { setTimeout } from 'node:timers/promises'
import {
  ORIGIN,
  startReplayNetwork,
  openProbe,
  localTarget
} from './network.mjs'
import { auditStorage } from './audit.mjs'
import {
  acquireCapture,
  browserIdentity,
  cloneBaseline,
  saveBaseline,
  validateName,
  waitForProfileExit
} from './storage.mjs'

const repo = fileURLToPath(new URL('../../', import.meta.url))
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    root: {
      type: 'string',
      default: path.join(repo, '__local_db/browser-profiles')
    },
    target: { type: 'string', default: 'http://127.0.0.1:3199' },
    from: { type: 'string' },
    'live-horde': { type: 'boolean', default: false },
    headless: { type: 'boolean', default: false }
  }
})
const [command, name] = positionals
const root = path.resolve(values.root)
process.umask(0o077)

async function waitForClose(context, directory) {
  const close = () => context.close().catch(() => {})
  process.once('SIGINT', close)
  process.once('SIGTERM', close)
  const interval = setInterval(async () => {
    try {
      await access(path.join(directory, 'close-request'))
      await close()
    } catch (error) {
      if (error.code !== 'ENOENT') console.error(error.message)
    }
  }, 500)
  try {
    await once(context, 'close')
  } finally {
    clearInterval(interval)
    process.removeListener('SIGINT', close)
    process.removeListener('SIGTERM', close)
    // close event can precede full browser process termination.
    await context.close()
  }
}

async function capture() {
  validateName(name)
  try {
    await access(path.join(root, 'baselines', name))
    throw new Error('That baseline already exists; choose a new name.')
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  const directory = await acquireCapture(root, name)
  if (values.from) {
    const source = await cloneBaseline(root, values.from)
    await cp(source.profile, path.join(directory, 'profile'), {
      recursive: true
    })
    await writeFile(
      path.join(directory, 'source.json'),
      JSON.stringify(source.manifest, null, 2)
    )
  }
  const identity = await browserIdentity()
  const context = await chromium.launchPersistentContext(
    path.join(directory, 'profile'),
    { channel: 'chromium', headless: values.headless }
  )
  identity.version = context.browser().version()
  try {
    const page = context.pages()[0] || (await context.newPage())
    await page.goto(`${ORIGIN}/artbot/create`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    })
    if (new URL(page.url()).origin !== ORIGIN)
      throw new Error(`Production redirected to another origin: ${page.url()}`)
    let databases = []
    const deadline = Date.now() + 60000
    while (
      !databases.some((db) => db.name === 'imageHorde' && db.version > 0)
    ) {
      if (Date.now() > deadline)
        throw new Error(
          'Production did not initialize imageHorde within 60 seconds.'
        )
      databases = await page.evaluate(() => indexedDB.databases())
      if (!databases.some((db) => db.name === 'imageHorde' && db.version > 0))
        await setTimeout(250)
    }
    await writeFile(
      path.join(directory, 'initial-databases.json'),
      JSON.stringify(databases, null, 2)
    )
    await page.screenshot({ path: path.join(directory, 'capture-start.png') })
    console.log(
      `Initialized databases: ${databases.map((db) => `${db.name} (native version ${db.version})`).join(', ')}`
    )
    console.log(
      `CAPTURE: real production, ${ORIGIN}/artbot\nBrowser: ${identity.version}\nProfile: ${directory}\nPopulate this dedicated browser, then run: npm run profile:seal -- ${name}\nClosing the browser or pressing Ctrl+C also saves the baseline.`
    )
    await waitForClose(context, directory)
  } finally {
    await context.close()
    await waitForProfileExit(path.join(directory, 'profile'))
  }
  const manifest = await saveBaseline({
    root,
    name,
    profile: path.join(directory, 'profile'),
    browser: identity
  })
  console.log(
    `Saved immutable baseline: ${name}\nProfile SHA-256: ${manifest.profileSha256}\nVerify contents: npm run profile:inspect -- ${name}`
  )
}

async function replay(inspect) {
  if (!inspect) {
    const target = localTarget(values.target)
    // Refuse a dead target before opening any persisted application tabs.
    const response = await fetch(new URL('/artbot', target), {
      redirect: 'manual',
      signal: AbortSignal.timeout(10000)
    })
    if (response.status >= 400)
      throw new Error(`Local server returned HTTP ${response.status}`)
    await response.body?.cancel()
  }
  const run = await cloneBaseline(root, name)
  const network = await startReplayNetwork({
    certDir: path.join(root, 'tls'),
    target: inspect ? undefined : values.target,
    liveHorde: !inspect && values['live-horde']
  })
  await writeFile(
    path.join(run.directory, 'replay.json'),
    JSON.stringify(
      {
        target: inspect ? null : values.target,
        liveHorde: !inspect && values['live-horde'],
        startedAt: new Date().toISOString()
      },
      null,
      2
    )
  )
  let context
  try {
    context = await chromium.launchPersistentContext(run.profile, {
      channel: 'chromium',
      headless: inspect || values.headless,
      ...network.launchOptions
    })
    const page = await openProbe(context, network)
    if (inspect) {
      const audit = await auditStorage(page)
      await writeFile(
        path.join(run.directory, 'audit.json'),
        JSON.stringify(audit, null, 2)
      )
      console.log(JSON.stringify(audit, null, 2))
      console.log(`Audit saved: ${path.join(run.directory, 'audit.json')}`)
    } else {
      await page.goto(`${ORIGIN}/artbot`, { waitUntil: 'domcontentloaded' })
      console.log(
        `REPLAY: ${ORIGIN} -> ${values.target}\nRun: ${run.directory}\n${values['live-horde'] ? 'Live Horde API and R2 image downloads enabled; other external browser traffic is blocked.' : 'External browser network is blocked.'} Service workers remain enabled.\nClose the browser or press Ctrl+C to finish; the baseline stays unchanged.`
      )
      await waitForClose(context, run.directory)
    }
  } finally {
    await context?.close()
    await network.close()
    console.log(
      `Local requests forwarded: ${network.stats.forwarded}; external attempts blocked: ${network.stats.blocked}; live Horde connections: ${network.stats.liveHorde}`
    )
  }
}

async function main() {
  await mkdir(root, { recursive: true, mode: 0o700 })
  if (command === 'capture') return capture()
  if (command === 'run') return replay(false)
  if (command === 'inspect') return replay(true)
  if (command === 'seal') {
    validateName(name)
    const directory = path.join(root, 'captures', name)
    const owner = JSON.parse(
      await readFile(path.join(directory, 'owner.json'), 'utf8')
    )
    process.kill(owner.pid, 0)
    await writeFile(path.join(directory, 'close-request'), '')
    console.log(
      'Requested clean browser shutdown and snapshot. Wait for the capture process to report Saved immutable baseline.'
    )
    return
  }
  if (command === 'list') {
    const entries = await readdir(path.join(root, 'baselines')).catch((e) => {
      if (e.code === 'ENOENT') return []
      throw e
    })
    for (const entry of entries) {
      const manifest = JSON.parse(
        await readFile(
          path.join(root, 'baselines', entry, 'manifest.json'),
          'utf8'
        )
      )
      console.log(
        `${manifest.name}\t${manifest.capturedAt}\tChromium ${manifest.browser.version}`
      )
    }
    return
  }
  console.log(
    'Usage: node scripts/browser-profile/cli.mjs capture|seal|inspect|run <name> [--target http://127.0.0.1:3199] [--root directory]\n       node scripts/browser-profile/cli.mjs list'
  )
}

main().catch((error) => {
  console.error(error.stack)
  process.exitCode = 1
})
