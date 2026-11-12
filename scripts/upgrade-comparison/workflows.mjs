import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile, mkdtemp } from 'node:fs/promises'
import { parseArgs } from 'node:util'
import { chromium, expect } from '@playwright/test'
import sharp from 'sharp'
import { cloneBaseline, treeHash } from '../browser-profile/storage.mjs'
import {
  startReplayNetwork,
  openProbe,
  ORIGIN
} from '../browser-profile/network.mjs'
import { auditStorage } from '../browser-profile/audit.mjs'
import { createHorde } from './horde.mjs'

const repo = fileURLToPath(new URL('../../', import.meta.url))
const { values } = parseArgs({
  options: {
    baseline: { type: 'string', default: 'production-pagination-favorites' },
    'expected-images': { type: 'string', default: '245' },
    control: { type: 'string', default: 'http://127.0.0.1:3297' },
    candidate: { type: 'string', default: 'http://127.0.0.1:34861' },
    'candidate-path': { type: 'string', default: '/artbot-beta' },
    lane: { type: 'string', default: 'all' },
    'reference-report': { type: 'string' }
  }
})
assert.ok(['all', 'control', 'candidate'].includes(values.lane))
assert.ok(['/artbot', '/artbot-beta'].includes(values['candidate-path']))
const count = Number(values['expected-images'])
assert.ok(Number.isSafeInteger(count) && count > 0)
process.umask(0o077)
const root = path.join(repo, '__local_db/browser-profiles')
const results = path.join(repo, '__local_db/upgrade-comparison/results')
await mkdir(results, { recursive: true })
const out = await mkdtemp(path.join(results, 'workflows-'))
const report = {
  baseline: values.baseline,
  started: new Date().toISOString(),
  lanes: {}
}
const save = () =>
  writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2))
const digest = (value) => createHash('sha256').update(value).digest('hex')
const upload = await sharp({
  create: { width: 256, height: 256, channels: 3, background: 'blue' }
})
  .png()
  .toBuffer()
const stores = (audit) =>
  audit.databases.flatMap((db) =>
    db.stores.map((store) => ({ ...store, database: db.name }))
  )

for (const name of ['control', 'candidate'].filter(
  (name) => values.lane === 'all' || values.lane === name
)) {
  const basePath = name === 'control' ? '/artbot' : values['candidate-path']
  const clone = await cloneBaseline(root, values.baseline)
  const network = await startReplayNetwork({
    certDir: path.join(root, 'tls'),
    target: values[name]
  })
  const backend = createHorde({ basePath })
  backend.release()
  const result = (report.lanes[name] = {
    target: values[name],
    basePath,
    profile: clone.directory,
    checks: [],
    errors: [],
    consoleErrors: [],
    baselineSha256: clone.manifest.profileSha256
  })
  let context
  try {
    result.build = await (
      await fetch(`${values[name]}${basePath}/api/server-info`)
    ).json()
    context = await chromium.launchPersistentContext(clone.profile, {
      channel: 'chromium',
      headless: true,
      viewport: { width: 1440, height: 1000 },
      ...network.launchOptions
    })
    await backend.install(context)
    for (const p of context.pages()) await p.close()
    let before
    if (values['reference-report']) {
      const previous = JSON.parse(
        await readFile(values['reference-report'], 'utf8')
      )
      assert.equal(previous.baseline, values.baseline)
      assert.equal(
        previous.lanes[name].baselineSha256,
        clone.manifest.profileSha256
      )
      assert.equal(previous.lanes[name].status, 'passed')
      before = JSON.parse(
        await readFile(
          path.join(
            path.dirname(values['reference-report']),
            `${name}-before.json`
          ),
          'utf8'
        )
      )
    } else {
      const probe = await openProbe(context, network)
      before = await auditStorage(probe, { recordDigests: true })
      await probe.close()
    }
    assert.equal(
      stores(before).find(
        (s) => s.database === 'imageHorde' && s.name === 'completed'
      ).rows,
      count
    )
    const page = await context.newPage()
    page.on('pageerror', (error) => result.errors.push(error.message))
    page.on('console', (message) => {
      if (
        message.type() === 'error' &&
        /TypeError|ReferenceError/.test(message.text())
      )
        result.consoleErrors.push(message.text().split('\n')[0].slice(0, 300))
    })
    await page.goto(`${ORIGIN}${basePath}/images`)
    await page.waitForFunction(() => !!window._artbotDb?.completed)
    await page.waitForLoadState('networkidle')
    const original = await page.evaluate(async () => {
      const db = window._artbotDb
      // Read one existing record at a time, including historical model fields.
      const native = await new Promise((resolve, reject) => {
        const request = indexedDB.open(db.name)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      const row = await new Promise((resolve, reject) => {
        const request = native
          .transaction('completed')
          .objectStore('completed')
          .openCursor()
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const cursor = request.result
          if (!cursor) return reject(new Error('No supported saved image'))
          const row = cursor.value
          const model = Array.isArray(row.models) ? row.models[0] : row.model
          if (
            typeof row.base64String === 'string' &&
            row.base64String &&
            [
              'Deliberate',
              'Realistic Vision',
              'Dreamshaper',
              'stable_diffusion'
            ].includes(model)
          )
            return resolve(row)
          cursor.continue()
        }
      })
      native.close()
      const bytes = new TextEncoder().encode(row.base64String)
      const sha = [
        ...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))
      ]
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
      return { jobId: row.jobId, sourceSha256: sha }
    })
    const chooseModel = async (model = 'Deliberate') => {
      await page
        .getByText('Image Model', { exact: true })
        .first()
        .locator('xpath=ancestor::div[.//*[@role="combobox"]][1]')
        .getByRole('combobox')
        .click()
      await page
        .locator('div[class*="-option"]')
        .filter({
          hasText: new RegExp(
            '^' + model.replace(/[.*+?^\u0024{}()|[\]\\]/g, '\\$&') + ' \\('
          )
        })
        .first()
        .click()
    }
    const reset = async () => {
      await page.goto(`${ORIGIN}${basePath}/create`)
      await page.waitForLoadState('networkidle')
      await expect(
        page.getByText('An unexpected error has occurred.', { exact: true })
      ).toHaveCount(0)
      await page
        .getByPlaceholder('Describe your image')
        .fill('snapshot reset marker')
      await page.getByTitle('Clear current input').first().click()
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Reset', exact: true })
        .click()
      await expect(page.getByPlaceholder('Describe your image')).toHaveValue('')
      await page.waitForLoadState('networkidle')
      await chooseModel()
      await page.locator('input[max="200"]:not([type="range"])').fill('1')
      await page.waitForTimeout(500)
    }
    const menu = async (label) => {
      await page.locator('.szh-menu-button').first().click()
      await page.getByRole('menuitem', { name: label, exact: true }).click()
    }
    const openOriginal = async () => {
      await page.goto(`${ORIGIN}${basePath}/image/${original.jobId}`)
      await expect(page.locator('.tabler-icon-refresh').first()).toBeVisible()
    }
    const mask = async () => {
      const canvas = page.locator('#canvas_mask')
      await expect(canvas).toBeVisible()
      await canvas.scrollIntoViewIfNeeded()
      const box = await canvas.boundingBox()
      await page.mouse.move(box.x + box.width / 4, box.y + box.height / 2)
      await page.mouse.down()
      await page.mouse.move(
        box.x + (box.width * 3) / 4,
        box.y + box.height / 2,
        { steps: 12 }
      )
      await page.mouse.up()
    }
    const setControl = async (control) => {
      const label = page.getByText('ControlNet Type', { exact: true }).first()
      await label
        .waitFor({ state: 'visible', timeout: 10000 })
        .catch(async () => {
          await page
            .getByText('ControlNet options', { exact: true })
            .first()
            .click()
          await label.waitFor({ state: 'visible' })
        })
      await label.locator('..').locator('div[class*="-control"]').click()
      await page.getByRole('option', { name: control, exact: true }).click()
    }
    const submit = async (label) => {
      await page
        .getByPlaceholder('Describe your image')
        .fill(`snapshot workflow ${label}`)
      await page.getByTitle('Create new image').first().click()
    }
    const run = async (label, action, verify, expected = 1) => {
      const start = backend.submissions.length
      await page.bringToFront()
      await action()
      await expect
        .poll(() => backend.submissions.length, { timeout: 45000 })
        .toBe(start + expected)
      const requests = backend.submissions.slice(start)
      for (const request of requests) await verify(request)
      await expect
        .poll(() => page.evaluate(() => window._artbotDb.completed.count()), {
          timeout: 90000
        })
        .toBe(count + backend.submissions.length)
      const ids = requests.map((_, i) => `comparison-job-${start + i + 1}`)
      const saved = await page.evaluate(async (ids) => {
        const rows = []
        for (const id of ids) {
          const row = await window._artbotDb.completed
            .where('jobId')
            .equals(id)
            .first()
          if (!row) throw new Error('Completed request was not saved')
          rows.push({
            tiling: row.tiling,
            controlType: row.control_type,
            hasSource: !!row.source_image,
            hasMask: !!row.source_mask
          })
        }
        return rows
      }, ids)
      for (let i = 0; i < requests.length; i++) {
        assert.equal(!!saved[i].tiling, !!requests[i].params.tiling)
        assert.equal(
          saved[i].controlType || '',
          requests[i].params.control_type || ''
        )
        if (requests[i].source_image) assert.equal(saved[i].hasSource, true)
        if (requests[i].source_mask) assert.equal(saved[i].hasMask, true)
      }
      await page.goto(`${ORIGIN}${basePath}/image/${ids[0]}`)
      const prompt = await page.evaluate(
        async (id) =>
          (await window._artbotDb.completed.where('jobId').equals(id).first())
            .prompt,
        ids[0]
      )
      await expect
        .poll(
          () =>
            page
              .getByAltText(prompt, { exact: true })
              .first()
              .evaluate((img) => img.naturalWidth),
          { timeout: 15000 }
        )
        .toBeGreaterThan(0)
      result.checks.push({
        label,
        submissions: requests.length,
        completed: expected,
        requests: requests.map((r) => ({
          models: r.models,
          sourceProcessing: r.source_processing,
          sourceSha256: r.source_image ? digest(r.source_image) : null,
          maskSha256: r.source_mask ? digest(r.source_mask) : null,
          width: r.params.width,
          height: r.params.height,
          tiling: r.params.tiling,
          controlType: r.params.control_type,
          postProcessing: r.params.post_processing
        }))
      })
      await save()
      console.log(`${name}: ${label} passed; results saved`)
    }
    await run(
      'tiling-text-to-image',
      async () => {
        await reset()
        const row = page
          .getByText('Tiling', { exact: true })
          .locator('xpath=ancestor::div[.//input[@type="checkbox"]][1]')
        if (!(await row.locator('input').isChecked()))
          await row.locator('label').click()
        await submit('tiling')
      },
      (request) => {
        assert.equal(request.params.tiling, true)
        assert.ok(!request.source_image)
      }
    )
    await run(
      'sdxl-three-image-batch',
      async () => {
        await reset()
        await chooseModel('AlbedoBase XL (SDXL)')
        await page.locator('input[max="200"]:not([type="range"])').fill('3')
        await submit('sdxl batch')
      },
      (request) => {
        assert.equal(request.models[0], 'AlbedoBase XL (SDXL)')
        assert.equal(request.params.n, 1)
      },
      3
    )
    await run(
      'reroll-existing-image',
      async () => {
        await openOriginal()
        await page.locator('.tabler-icon-refresh').first().click()
      },
      (request) => assert.ok(request.models.length)
    )
    await run(
      'upscale-existing-image',
      async () => {
        await openOriginal()
        await menu('Upscale image')
      },
      (request) =>
        assert.ok(request.params.post_processing.includes('RealESRGAN_x4plus'))
    )
    await run(
      'existing-image-to-img2img',
      async () => {
        await openOriginal()
        await menu('Use for img2img')
        await submit('existing img2img')
      },
      (request) => {
        assert.equal(request.source_processing, 'img2img')
        assert.equal(digest(request.source_image), original.sourceSha256)
      }
    )
    await run(
      'existing-image-to-inpainting',
      async () => {
        await openOriginal()
        await menu('Use for inpainting')
        await mask()
        await submit('existing inpainting')
      },
      async (request) => {
        assert.equal(request.source_processing, 'inpainting')
        assert.equal(digest(request.source_image), original.sourceSha256)
        const stats = await sharp(
          Buffer.from(request.source_mask, 'base64')
        ).stats()
        assert.ok(stats.channels[0].min < 50 && stats.channels[0].max > 200)
      }
    )
    for (const control of ['canny', 'depth'])
      await run(
        `existing-image-to-controlnet-${control}`,
        async () => {
          await openOriginal()
          await menu('Use for ControlNet')
          await setControl(control)
          await submit(`existing ${control}`)
        },
        (request) => {
          assert.equal(request.params.control_type, control)
          assert.equal(digest(request.source_image), original.sourceSha256)
        }
      )
    await run(
      'uploaded-source-img2img',
      async () => {
        await reset()
        await page.goto(`${ORIGIN}${basePath}/create?panel=img2img`)
        await page.locator('input[type="file"]').first().setInputFiles({
          name: 'source.png',
          mimeType: 'image/png',
          buffer: upload
        })
        await expect(
          page.getByRole('button', { name: 'Use Inpaint' })
        ).toBeVisible()
        await submit('uploaded source')
      },
      async (request) => {
        assert.equal(request.source_processing, 'img2img')
        assert.equal(
          (await sharp(Buffer.from(request.source_image, 'base64')).metadata())
            .width,
          256
        )
      }
    )
    await run(
      'url-import-img2img',
      async () => {
        await reset()
        await page.goto(`${ORIGIN}${basePath}/create?panel=img2img`)
        await page
          .locator('input[name="img-url"]')
          .fill('https://example.test/source.webp')
        await page.getByTitle('Upload image from URL').click()
        await expect(
          page.getByRole('button', { name: 'Use Inpaint' })
        ).toBeVisible()
        await submit('URL source')
      },
      (request) => {
        assert.equal(request.source_processing, 'img2img')
        assert.ok(request.source_image)
        assert.equal(backend.urlImports.length, 1)
      }
    )
    await run(
      'drawing-canvas-to-depth-controlnet',
      async () => {
        await reset()
        await page.goto(`${ORIGIN}${basePath}/draw`)
        await expect(page.locator('canvas.upper-canvas')).toBeVisible()
        await page.locator('.tabler-icon-menu').first().click()
        await page.getByText('Upload image', { exact: true }).click()
        await page.locator('input[type="file"]').first().setInputFiles({
          name: 'canvas.png',
          mimeType: 'image/png',
          buffer: upload
        })
        await expect
          .poll(() =>
            page
              .locator('canvas.lower-canvas')
              .evaluate((canvas) => canvas.width)
          )
          .toBeGreaterThan(0)
        await page.locator('.tabler-icon-menu').first().click()
        await page.getByText('Use for ControlNet', { exact: true }).click()
        await expect(page).toHaveURL(/controlnet\?drawing=true/)
        await chooseModel()
        await setControl('depth')
        await submit('drawing depth')
      },
      (request) => {
        assert.equal(request.params.control_type, 'depth')
        assert.ok(request.source_image)
      }
    )
    await openOriginal()
    await menu('Interrogate (img2text)')
    await expect(page.getByText('a snapshot test image').first()).toBeVisible({
      timeout: 20000
    })
    assert.equal(
      digest(backend.interrogations[0].source_image),
      original.sourceSha256
    )
    result.checks.push({ label: 'interrogate-existing-image', passed: true })
    await page.goto(`${ORIGIN}${basePath}/images`)
    await page.reload()
    assert.equal(
      await page.evaluate(() => window._artbotDb.completed.count()),
      count + backend.submissions.length
    )
    await page.close()
    const probe = await openProbe(context, network)
    const after = await auditStorage(probe, { recordDigests: true })
    for (const store of stores(before).filter(
      (s) => !['pending', 'settings'].includes(s.name)
    )) {
      const current = stores(after).find(
        (s) => s.name === store.name && s.database === store.database
      )
      assert.ok(current, 'Original store missing')
      for (const row of store.recordDigests)
        assert.deepEqual(
          current.recordDigests.find((r) => r.keySha256 === row.keySha256),
          row,
          'Original image or source bytes changed'
        )
    }
    assert.deepEqual(result.errors, [])
    result.originalRecordsPreserved = true
    result.newCompleted = backend.submissions.length
    result.status = 'passed'
  } catch (error) {
    result.status = 'failed'
    result.failure = error.stack
    result.diagnostics = await context
      ?.pages()
      .at(-1)
      ?.evaluate(async () => ({
        focused: document.hasFocus(),
        visible: document.visibilityState,
        pending: window._artbotDb
          ? (await window._artbotDb.pending.toArray()).map((row) => ({
              status: row.jobStatus,
              error: row.apiErrorMessage || row.errorMessage || null
            }))
          : []
      }))
      .catch(() => null)
    for (const [i, page] of (context?.pages() || []).entries())
      await page
        .screenshot({
          path: path.join(out, `${name}-failure-${i}.png`),
          fullPage: true
        })
        .catch(() => {})
  } finally {
    await context?.close()
    await network.close()
    assert.equal(
      await treeHash(path.join(root, 'baselines', values.baseline, 'profile')),
      clone.manifest.profileSha256
    )
    await save()
  }
}
report.finished = new Date().toISOString()
await save()
console.log(`Workflows report: ${out}/report.json`)
if (Object.values(report.lanes).some((lane) => lane.status !== 'passed'))
  process.exitCode = 1
