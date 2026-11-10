/**
 * Generates e2e/fixtures/library.json: a small image library made by real AI
 * Horde workers and saved by the real app (submit, poll, EXIF, thumbnails).
 *
 * Requires a production build and HORDE_KEY in the environment or .env. Costs
 * roughly 500 kudos. Run with: npm run test:generate-library
 *
 * Options: HEADED=1 shows the browser, CHROME_PATH picks the browser binary,
 * PORT changes the server port, OUTPUT changes the output file.
 */
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import { chromium } from '@playwright/test'
import dotenv from 'dotenv'
import sharp from 'sharp'

dotenv.config()

const HORDE_KEY = (process.env.HORDE_KEY || '')
  .trim()
  .replace(/^['"]|['"]$/g, '')
const PORT = process.env.PORT || '3199'
const BASE_URL = `http://localhost:${PORT}/artbot`
const OUTPUT =
  process.env.OUTPUT || path.join(process.cwd(), 'e2e/fixtures/library.json')
const PHASE_TIMEOUT_MS = 8 * 60 * 1000
const MAX_ATTEMPTS = 4

const CHROME_FOR_TESTING = path.join(
  homedir(),
  '.cache/puppeteer/chrome/mac_arm-131.0.6778.204/chrome-mac-arm64',
  'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
)

// The API key may only ever be sent to the Horde. Images come back from R2.
const ALLOWED_HOSTS = [/(^|\.)aihorde\.net$/, /\.r2\.cloudflarestorage\.com$/]

const job = (fixtureName, overrides = {}) => ({
  fixtureName,
  jobId: randomUUID(),
  parentJobId: randomUUID(),
  jobStatus: 'waiting',
  timestamp: Date.now(),
  jobTimestamp: Date.now(),
  prompt: 'a small red cube on a wooden table',
  negative: '',
  models: ['Deliberate'],
  modelVersion: '',
  sampler: 'k_euler',
  steps: 8,
  cfg_scale: 7,
  width: 128,
  height: 128,
  orientation: 'custom',
  karras: true,
  hires: false,
  clipskip: 1,
  tiling: false,
  numImages: 1,
  seed: '',
  post_processing: [],
  preset: [],
  triggers: [],
  loras: [],
  tis: [],
  upscaled: false,
  workflow: '',
  extra_texts: null,
  denoising_strength: '',
  control_type: '',
  image_is_control: false,
  return_control_map: false,
  source_image: '',
  source_mask: '',
  source_processing: 'prompt',
  canvasData: null,
  maskData: null,
  ...overrides
})

const large = (fixtureName, overrides = {}) =>
  job(fixtureName, {
    width: 512,
    height: 512,
    steps: 20,
    prompt: 'a large red sphere on a marble floor',
    ...overrides
  })

const batchParent = randomUUID()
const batch = (index) =>
  job(`batch-${index}`, {
    parentJobId: batchParent,
    numImages: 3,
    prompt: 'a blue sphere in the snow'
  })

const firstPhase = () => [
  job('model-deliberate', { seed: '1001' }),
  job('model-stable-diffusion', {
    models: ['stable_diffusion'],
    prompt: 'a green pyramid in the desert'
  }),
  job('model-dreamshaper', {
    models: ['Dreamshaper'],
    prompt: 'a yellow boat on a lake'
  }),
  job('model-anything', {
    models: ['Anything Diffusion'],
    prompt: 'a small robot reading a book'
  }),
  job('model-realistic-vision', {
    models: ['Realistic Vision'],
    prompt: 'a white lighthouse at sunset'
  }),
  job('sampler-euler-a', { sampler: 'k_euler_a', prompt: 'an orange leaf' }),
  job('sampler-dpmpp-2m', { sampler: 'k_dpmpp_2m', prompt: 'a purple flower' }),
  job('sampler-heun', { sampler: 'k_heun', prompt: 'a grey stone bridge' }),
  job('size-portrait', { width: 128, height: 192, prompt: 'a tall tree' }),
  job('size-landscape', { width: 192, height: 128, prompt: 'rolling hills' }),
  job('size-smallest', { width: 64, height: 64, prompt: 'a single dot' }),
  job('negative-prompt', {
    prompt: 'a cup of coffee',
    negative: 'blurry, low quality'
  }),
  job('fixed-seed', { seed: '1234', prompt: 'a brown teapot' }),
  job('karras-off', { karras: false, prompt: 'a red bicycle' }),
  job('clip-skip-2', { clipskip: 2, prompt: 'a silver spoon' }),
  job('tiling', { tiling: true, prompt: 'a brick wall texture' }),
  batch(1),
  batch(2),
  batch(3),
  job('upscaled', {
    post_processing: ['RealESRGAN_x2plus'],
    upscaled: true,
    prompt: 'a small wooden chair'
  }),
  large('large-deliberate', { seed: '2001' }),
  large('large-realistic-vision', {
    models: ['Realistic Vision'],
    prompt: 'a stone cottage in a meadow'
  }),
  large('large-sdxl', {
    models: ['AlbedoBase XL (SDXL)'],
    prompt: 'a paper boat on a pond'
  }),
  large('large-hires-fix', { hires: true, prompt: 'a mountain lake at dawn' }),
  large('large-lora', {
    prompt: 'a detailed pocket watch on a table',
    loras: [{ name: '58390', label: 'Add Detail', model: 1, clip: 1 }]
  }),
  large('large-embedding', {
    prompt: 'a bowl of fresh fruit',
    tis: [
      {
        name: '7808',
        label: 'EasyNegative',
        inject_ti: 'negprompt',
        strength: 1
      }
    ]
  }),
  large('large-face-fix', {
    prompt: 'a portrait of an elderly fisherman wearing a wool hat',
    post_processing: ['GFPGAN'],
    facefixer_strength: 0.75
  })
]

const centerMask = (size) =>
  sharp({
    create: { width: size, height: size, channels: 3, background: 'black' }
  })
    .composite([
      {
        input: {
          create: {
            width: size / 2,
            height: size / 2,
            channels: 3,
            background: 'white'
          }
        },
        left: size / 4,
        top: size / 4
      }
    ])
    .webp()
    .toBuffer()

const secondPhase = async (source, largeSource) => {
  const mask = await centerMask(128)
  const largeMask = await centerMask(512)

  return [
    large('large-img2img', {
      prompt: 'a large gold sphere on a marble floor',
      source_image: largeSource,
      source_processing: 'img2img',
      denoising_strength: 0.6
    }),
    large('large-inpainting', {
      models: ['Deliberate Inpainting'],
      prompt: 'a green apple on a wooden table',
      source_image: largeSource,
      source_mask: largeMask.toString('base64'),
      source_processing: 'inpainting',
      denoising_strength: 0.75
    }),
    large('large-controlnet', {
      prompt: 'a glass sculpture, studio lighting',
      source_image: largeSource,
      source_processing: 'img2img',
      control_type: 'canny',
      denoising_strength: 0.75
    }),
    job('img2img', {
      prompt: 'a small gold cube on a wooden table',
      source_image: source,
      source_processing: 'img2img',
      denoising_strength: 0.6
    }),
    job('inpainting', {
      models: ['Deliberate Inpainting'],
      prompt: 'a small green cube on a wooden table',
      source_image: source,
      source_mask: mask.toString('base64'),
      source_processing: 'inpainting',
      denoising_strength: 0.75
    })
  ]
}

const startServer = async () => {
  const server = spawn(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'start', '-p', PORT],
    { env: { ...process.env, NODE_ENV: 'production' }, stdio: 'ignore' }
  )

  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(`${BASE_URL}/create`)
      if (response.ok) return server
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  server.kill()
  throw new Error('The server did not start. Did you run a production build?')
}

const lockDownNetwork = (page) =>
  page.route('**/*', (route) => {
    const url = new URL(route.request().url())

    if (url.hostname === 'localhost') {
      // Keep test data out of production telemetry and error logs.
      if (/\/api\/(telemetry|log-error)/.test(url.pathname)) {
        return route.fulfill({ status: 200, json: { success: true } })
      }
      return route.continue()
    }

    return ALLOWED_HOSTS.some((host) => host.test(url.hostname))
      ? route.continue()
      : route.abort()
  })

const openApp = async (page) => {
  await page.goto(`${BASE_URL}/pending`)
  await page.waitForFunction(() => Boolean(window._artbotDb?.completed))
}

// Workers' safety filters sometimes censor tiny, noisy images of harmless
// prompts, so failed jobs get a few more tries with the censor still on.
const runJobs = async (page, jobs) => {
  let remaining = jobs
  let result

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    result = await runAttempt(page, remaining)
    if (result.failed.length === 0 || attempt === MAX_ATTEMPTS) break

    const names = result.failed.map((failure) => failure.name)
    console.log(`Retrying: ${names.join(', ')}`)

    await page.evaluate(
      (failedNames) =>
        window._artbotDb.pending
          .filter((row) => failedNames.includes(row.fixtureName))
          .delete(),
      names
    )
    remaining = remaining
      .filter((item) => names.includes(item.fixtureName))
      .map((item) => ({ ...item, jobId: randomUUID() }))
  }

  return result
}

const runAttempt = async (page, jobs) => {
  await page.evaluate((rows) => window._artbotDb.pending.bulkAdd(rows), jobs)
  await openApp(page) // The app loads queued jobs from IndexedDB at startup.

  const names = jobs.map((item) => item.fixtureName)
  const deadline = Date.now() + PHASE_TIMEOUT_MS
  let state

  while (Date.now() < deadline) {
    state = await page.evaluate(async (wanted) => {
      const db = window._artbotDb
      const saved = (await db.completed.toArray()).map((r) => r.fixtureName)
      const failed = (await db.pending.toArray())
        .filter((r) => r.jobStatus === 'error')
        .filter((r) => wanted.includes(r.fixtureName))
        .map((r) => ({ name: r.fixtureName, message: r.errorMessage }))

      return { saved: wanted.filter((n) => saved.includes(n)), failed }
    }, names)

    console.log(`${state.saved.length}/${names.length} saved`)
    if (state.saved.length + state.failed.length >= names.length) break
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }

  return {
    failed: state.failed,
    missing: names.filter(
      (name) =>
        !state.saved.includes(name) &&
        !state.failed.some((failure) => failure.name === name)
    )
  }
}

// Reduces a real row to the shape ArtBot saved in its early days.
const toLegacyRow = (row, jobId) => {
  const legacy = { ...row, jobId, model: row.models[0] }

  for (const field of [
    'models',
    'parentJobId',
    'jobStatus',
    'thumbnail',
    'source_image',
    'generations',
    'fixtureName'
  ]) {
    delete legacy[field]
  }

  return legacy
}

const buildFixture = (completed) => {
  // Table ids are dropped so rows can be added to any database.
  const rows = completed.map((row) => {
    const copy = { ...row }
    delete copy.id
    return copy
  })
  const named = (name) => rows.find((row) => row.fixtureName === name)
  const favorites = ['model-deliberate', 'fixed-seed', 'upscaled']

  for (const name of favorites) {
    if (named(name)) named(name).favorited = true
  }

  const legacy = ['model-deliberate', 'sampler-euler-a']
    .filter(named)
    .map((name, index) => toLegacyRow(named(name), `legacy-${index + 1}`))

  const pending = [
    job('pending-waiting', { prompt: 'still waiting' }),
    {
      ...job('pending-error', { prompt: 'this one failed' }),
      jobStatus: 'error',
      errorMessage:
        'The worker GPU processing this request encountered an error. Retry?'
    }
  ]

  return { completed: rows, legacy, pending }
}

const main = async () => {
  if (!HORDE_KEY) throw new Error('HORDE_KEY is not set.')

  const server = await startServer()
  const executablePath =
    process.env.CHROME_PATH ||
    (existsSync(CHROME_FOR_TESTING) ? CHROME_FOR_TESTING : undefined)
  const browser = await chromium.launch({
    executablePath,
    headless: !process.env.HEADED
  })

  try {
    const page = await browser.newPage()
    await lockDownNetwork(page)
    await openApp(page)
    await page.evaluate((apiKey) => {
      const config = JSON.parse(localStorage.getItem('appConfig') || '{}')
      localStorage.setItem('appConfig', JSON.stringify({ ...config, apiKey }))
    }, HORDE_KEY)

    const first = await runJobs(page, firstPhase())

    const imageNamed = (name) =>
      page.evaluate(
        async (wanted) =>
          (await window._artbotDb.completed.toArray()).find(
            (row) => row.fixtureName === wanted
          )?.base64String,
        name
      )
    const source = await imageNamed('model-deliberate')
    const largeSource = await imageNamed('large-deliberate')
    if (!source || !largeSource) {
      throw new Error('The source images for img2img were not created.')
    }

    const second = await runJobs(page, await secondPhase(source, largeSource))
    const problems = [
      ...first.failed,
      ...second.failed,
      ...[...first.missing, ...second.missing].map((name) => ({
        name,
        message: 'timed out'
      }))
    ]

    const completed = await page.evaluate(() =>
      window._artbotDb.completed.toArray()
    )
    const output = JSON.stringify(
      { generatedOn: new Date().toISOString(), ...buildFixture(completed) },
      null,
      2
    )

    if (output.includes(HORDE_KEY)) {
      throw new Error(
        'The API key leaked into the fixture. Nothing was written.'
      )
    }

    mkdirSync(path.dirname(OUTPUT), { recursive: true })
    writeFileSync(OUTPUT, `${output}\n`)

    console.log(`Saved ${completed.length} images to ${OUTPUT}`)
    if (problems.length > 0) {
      console.log('Not generated:', JSON.stringify(problems))
      process.exitCode = 1
    }
  } finally {
    await browser.close()
    server.kill()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
