#!/usr/bin/env node
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, writeFile, copyFile } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { createHash } from 'node:crypto'
import {
  Driver,
  UnavailableNativeFiles,
  IncompleteNativeFiles
} from './driver.mjs'
import { receiveExternalFile } from './externalFiles.mjs'
import {
  repo,
  command,
  simctl,
  freePort,
  buildArtifact,
  serve,
  startAppium,
  chooseRuntime,
  createDevice,
  savedInventory,
  platform,
  stopChildren
} from './lab.mjs'
import {
  makeFixture,
  auditLibrary,
  assertFresh,
  assertFixture,
  favoriteLoras
} from './fixture.cjs'

const { values } = parseArgs({
  options: {
    'build-dir': { type: 'string' },
    'saved-run': { type: 'string' },
    runtime: { type: 'string' },
    help: { type: 'boolean', short: 'h' }
  }
})
if (values.help) {
  console.log(
    'npm run test:ios -- [--build-dir /absolute/isolated-production-build] [--runtime com.apple.CoreSimulator.SimRuntime.iOS-26-5] [--saved-run /absolute/path/to/prior-synthetic-run]'
  )
  process.exit(0)
}
process.umask(0o077)
const runtime = await chooseRuntime(values.runtime)
const root = path.join(repo, '__local_db/ios-pwa-runs')
await mkdir(root, { recursive: true })
const directory = await mkdtemp(path.join(root, 'run-'))
const report = {
  status: 'running',
  startedAt: new Date().toISOString(),
  directory,
  platform,
  runtime: {
    identifier: runtime.identifier,
    version: runtime.version,
    build: runtime.buildversion
  },
  sourceCommit: await command('git', ['rev-parse', 'HEAD'], { cwd: repo }),
  worktree: await command('git', ['status', '--short'], { cwd: repo }),
  steps: [],
  devices: [],
  cleanup: []
}
let front, appium, driver
async function selectedFileAccess() {
  return driver.audit(async () => {
    const result = []
    for (const input of document.querySelectorAll('input[type="file"]')) {
      for (const file of input.files) {
        const entry = {
          input: input.getAttribute('aria-label'),
          name: file.name,
          size: file.size
        }
        try {
          const bytes = await file.slice(0, 1).arrayBuffer()
          entry.bytesRead = bytes.byteLength
          entry.readable = file.size > 0 && bytes.byteLength === 1
        } catch (error) {
          entry.error = { name: error.name, message: error.message }
        }
        result.push(entry)
      }
    }
    return result
  })
}
const persist = () =>
  writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify(report, null, 2)
  )
async function step(name, action) {
  const entry = { name, status: 'running', startedAt: new Date().toISOString() }
  report.steps.push(entry)
  console.log(`[iOS PWA] ${name}`)
  await persist()
  try {
    const value = await action()
    entry.status = 'passed'
    if (value !== undefined) entry.result = value
    if (driver?.id)
      await driver.snapshot(String(report.steps.length).padStart(2, '0'))
    return value
  } catch (error) {
    entry.status = 'failed'
    entry.error = error.message
    if (driver?.context)
      entry.selectedFiles = await selectedFileAccess().catch((error) => ({
        diagnosticError: error.message
      }))
    if (driver?.id) {
      entry.browserState = await driver
        .web(
          'return {url:location.href,ready:document.readyState,visible:document.visibilityState,database:window._artbotDb?.name,open:window._artbotDb?.isOpen(),version:window._artbotDb?.verno}'
        )
        .catch((error) => ({ diagnosticError: error.message }))
      entry.libraryAfterFailure = await driver
        .audit(auditLibrary)
        .catch((error) => ({
          diagnosticError: error.message
        }))
      const device = report.devices.at(-1)
      entry.externalFilesAfterFailure = []
      if (device?.files) {
        for (const folder of ['ArtBot Backups', 'ArtBot Damaged']) {
          for (const name of await savedInventory(
            path.join(device.files, folder)
          ).catch(() => [])) {
            try {
              const bytes = await readFile(
                path.join(device.files, folder, name)
              )
              entry.externalFilesAfterFailure.push({
                folder,
                name,
                size: bytes.length,
                sha256: createHash('sha256').update(bytes).digest('hex')
              })
            } catch (diagnosticError) {
              entry.externalFilesAfterFailure.push({
                folder,
                name,
                diagnosticError: diagnosticError.message
              })
            }
          }
        }
      }
      await driver.snapshot('failure').catch(() => {})
    }
    throw error
  } finally {
    entry.finishedAt = new Date().toISOString()
    await persist()
  }
}
async function startDevice(role) {
  const device = await step(`Create fresh ${role} simulator`, () =>
    createDevice(
      `ArtBot Backup ${path.basename(directory)} ${role}`,
      runtime,
      front.cert,
      async (id) => {
        report.devices.push({ id, role })
        await persist()
      }
    )
  )
  Object.assign(
    report.devices.find((entry) => entry.id === device.id),
    device
  )
  await mkdir(path.join(device.files, 'ArtBot Fixture'), { recursive: true })
  await mkdir(path.join(device.files, 'ArtBot Backups'), { recursive: true })
  await mkdir(path.join(device.files, 'ArtBot Damaged'), { recursive: true })
  driver = new Driver(appium.address, path.join(directory, role), front.origin)
  await step(`Install ${role} Home Screen PWA`, async () => {
    await driver.start(
      device.id,
      appium.derivedData,
      await freePort(),
      await freePort()
    )
    await driver.installPWA()
    await driver.settings()
  })
  return device
}
const bodyHas = (text) =>
  `return document.body.innerText.includes(${JSON.stringify(text)})`
const statusHas = (heading, text) =>
  `const panel=[...document.querySelectorAll('h3')].find(h=>h.textContent.trim()===${JSON.stringify(
    heading
  )})?.parentElement;return [...(panel?.querySelectorAll('[role="status"]')||[])].some(s=>${JSON.stringify(
    Array.isArray(text) ? text : [text]
  )}.some(t=>s.textContent.includes(t)))`
const receive = async (device, folder, name, bytes) => {
  console.log(`[iOS PWA] Receive ${name} through native Save to Files`)
  const result = await receiveExternalFile(driver, device, folder, name, bytes)
  ;(report.transfers ||= []).push(result)
  await persist()
  return result
}
// Follow only the app's explicit unavailable-file recovery path. These are
// fresh native selections, never retries of restore or waivers of checksums.
const chooseFiles = async (input, folder, names) => {
  const before = await driver.audit(auditLibrary)
  let recovery
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await driver.openFiles(input, folder, names)
      if (recovery) {
        recovery.reselected = true
        await persist()
      }
      return
    } catch (error) {
      if (
        !(error instanceof UnavailableNativeFiles) &&
        !(error instanceof IncompleteNativeFiles)
      )
        throw error
      const heading =
        input === 'Verify saved backup'
          ? 'Back up this library'
          : 'Restore a library'
      await driver.waitWeb(
        'unavailable-file guidance in the affected panel',
        statusHas(
          heading,
          error instanceof IncompleteNativeFiles
            ? [
                'Select one complete backup manifest and all its parts',
                'Select the backup manifest and every listed part',
                'Missing, duplicate or unexpected backup files.'
              ]
            : [
                'empty or unavailable',
                'A selected backup file could not be read.'
              ]
        )
      )
      const after = await driver.audit(auditLibrary)
      assert.deepEqual(
        after,
        before,
        'Unavailable selections must preserve the library and verification progress'
      )
      recovery = {
        step: report.steps.at(-1)?.name,
        input,
        folder,
        files: error.files,
        kind: error.name,
        expected: error.expected,
        received: error.received,
        attempt: attempt + 1,
        libraryPreserved: true,
        verificationPreserved: true,
        reselected: false,
        next:
          attempt === 2
            ? 'stop'
            : attempt === 0
              ? 'fresh-native-selection'
              : 'reopen-and-select'
      }
      ;(report.providerRecoveries ||= []).push(recovery)
      await persist()
      if (attempt === 2) throw error
      console.log(
        '[iOS PWA] Native file-delivery failure rejected safely; selecting the complete saved set again'
      )
      if (attempt === 1) {
        await driver.reopen()
        await driver.settings()
      }
    }
  }
}
const verify = async (names, status) => {
  await chooseFiles('Verify saved backup', 'ArtBot Backups', names)
  await driver.waitWeb(status, statusHas('Back up this library', status))
}
let cleaning
function cleanup() {
  return (cleaning ||= (async () => {
    await driver?.stop().catch((error) => {
      report.cleanup.push(error.message)
      process.exitCode = 1
      report.status = 'failed'
    })
    for (const device of report.devices) {
      await simctl('shutdown', device.id).catch(() => {})
      await simctl('delete', device.id)
        .then(() => report.cleanup.push(`Deleted owned simulator ${device.id}`))
        .catch((error) => {
          report.cleanup.push(error.message)
          process.exitCode = 1
          report.status = 'failed'
        })
    }
    await appium?.stop().catch((error) => {
      report.cleanup.push(error.message)
      process.exitCode = 1
      report.status = 'failed'
    })
    await front?.stop().catch((error) => {
      report.cleanup.push(error.message)
      process.exitCode = 1
      report.status = 'failed'
    })
    await stopChildren().catch((error) => {
      report.cleanup.push(error.message)
      process.exitCode = 1
      report.status = 'failed'
    })
    report.finishedAt = new Date().toISOString()
    await persist()
  })())
}
for (const signal of ['SIGINT', 'SIGTERM'])
  process.once(signal, async () => {
    report.status = 'interrupted'
    report.error = signal
    await cleanup()
    process.exit(signal === 'SIGINT' ? 130 : 143)
  })
try {
  const build = values['build-dir']
    ? path.resolve(values['build-dir'])
    : await step('Build isolated application', () => buildArtifact(directory))
  report.applicationArtifact = {
    directory: build,
    nextBuildId: (
      await readFile(path.join(build, 'build/BUILD_ID'), 'utf8')
    ).trim(),
    exportPageSHA256: createHash('sha256')
      .update(
        await readFile(
          path.join(build, 'app/_pages/SettingsPage/ExportDatabase/index.tsx')
        )
      )
      .digest('hex')
  }
  front = await step('Start isolated trusted HTTPS application', () =>
    serve(build, directory)
  )
  // Do not serialize server handles or keys in the report.
  report.steps.at(-1).result = { origin: front.origin, build: front.buildInfo }
  appium = await step('Start pinned native test tools', () =>
    startAppium(directory)
  )
  report.steps.at(-1).result = { address: appium.address }
  const fixture = await makeFixture()
  await writeFile(
    path.join(directory, 'expected.json'),
    JSON.stringify(fixture.expected, null, 2)
  )
  let names, source
  if (values['saved-run']) {
    await step(
      'Replay a verified synthetic export for destination-only checks',
      async () => {
        const previous = path.resolve(values['saved-run'])
        const proof = JSON.parse(
          await readFile(path.join(previous, 'report.json'))
        )
        const imported = proof.steps.find(
          (entry) =>
            entry.name === 'Import synthetic source library through Files'
        )
        const exported = proof.steps.find(
          (entry) =>
            entry.name === 'Audit external saved set and stop the source app'
        )
        assert.equal(imported?.status, 'passed')
        assertFixture(imported.result, fixture.expected)
        assert.equal(exported?.status, 'passed')
        names = exported.result.names
        assert.ok(Array.isArray(names) && names.length > 2)
        assert.ok(names.every((name) => path.basename(name) === name))
        await mkdir(path.join(directory, 'saved-files'))
        for (const name of names) {
          const bytes = await readFile(path.join(previous, 'saved-files', name))
          assert.equal(
            createHash('sha256').update(bytes).digest('hex'),
            exported.result.hashes[name]
          )
          await writeFile(path.join(directory, 'saved-files', name), bytes)
        }
        report.replayedExport = previous
        return {
          previous,
          names,
          sourceImportAudited: true,
          savedHashesMatched: true
        }
      }
    )
  } else {
    source = await startDevice('source')
    const sourceFolder = path.join(source.files, 'ArtBot Backups')
    await step('Import synthetic source library through Files', async () => {
      assertFresh(await driver.audit(auditLibrary))
      await receive(
        source,
        'ArtBot Fixture',
        'synthetic-library.json',
        fixture.buffer
      )
      assertFresh(await driver.audit(auditLibrary))
      await chooseFiles('Choose backup files', 'ArtBot Fixture', [
        'synthetic-library.json'
      ])
      await driver.scrollButton('Restore library')
      await driver.button('Restore library')
      await driver.waitWeb(
        'legacy import completed',
        bodyHas('ArtBot database imported!')
      )
      await driver.web(
        'localStorage.setItem("favoriteLoras", arguments[0]);return true',
        [favoriteLoras]
      )
      const result = await driver.audit(auditLibrary)
      assertFixture(result, fixture.expected)
      return result
    })
    await step('Prepare and save manifest through native Files', async () => {
      await driver.scrollButton('Prepare backup')
      await driver.button('Prepare backup')
      await driver.waitWeb(
        'preparation completed',
        bodyHas('Prepared locally.')
      )
      await driver.share('Share/save manifest', 'ArtBot Backups', async () =>
        (await savedInventory(sourceFolder)).some((name) =>
          name.endsWith('.manifest.json')
        )
      )
    })
    const [manifestName] = await savedInventory(sourceFolder)
    assert.match(manifestName, /^artbot-.*\.manifest\.json$/)
    const manifest = JSON.parse(
      await readFile(path.join(sourceFolder, manifestName))
    )
    assert.ok(
      manifest.parts.length >= 2,
      'Fixture must exercise multiple data parts'
    )
    names = [manifestName, ...manifest.parts.map((part) => part.name)]
    await step(
      'Verify manifest alone and retain progress after app termination',
      async () => {
        await verify(
          [manifestName],
          `Verified 1 of ${names.length} saved files.`
        )
        await driver.reopen()
        await driver.waitWeb(
          'Continue backup after relaunch',
          'return !![...document.querySelectorAll("a")].find(a=>a.textContent.trim()==="Continue backup")'
        )
        const state = await driver.audit(auditLibrary)
        assert.equal(state.handoff.id, manifest.id)
        assert.equal(state.handoff.verified, 1)
        assert.equal(state.handoff.total, names.length)
        await driver.click(
          'type == "XCUIElementTypeLink" AND name == "Continue backup"'
        )
        await driver.waitWeb(
          'same prepared backup',
          bodyHas('Recovered prepared backup.')
        )
        return state
      }
    )
    await step(
      'Retain partial verification through a full simulator restart',
      async () => {
        const before = await driver.audit(auditLibrary)
        await driver.stop()
        driver = undefined
        await simctl('shutdown', source.id)
        await simctl('boot', source.id)
        await simctl('bootstatus', source.id, '-b')
        driver = new Driver(
          appium.address,
          path.join(directory, 'source'),
          front.origin
        )
        await driver.start(
          source.id,
          appium.derivedData,
          await freePort(),
          await freePort()
        )
        await driver.reopen()
        await driver.waitWeb(
          'Continue backup after simulator restart',
          bodyHas('Continue backup')
        )
        const result = await driver.audit(auditLibrary)
        assert.deepEqual(result, before)
        await driver.click(
          'type == "XCUIElementTypeLink" AND name == "Continue backup"'
        )
        await driver.waitWeb(
          'same preparation after restart',
          bodyHas('Recovered prepared backup.')
        )
        return result
      }
    )
    await step(
      'Cancel native verification picker without advancing saved-file progress',
      async () => {
        const before = await driver.audit(auditLibrary)
        await driver.cancelFiles('Verify saved backup')
        const result = await driver.audit(auditLibrary)
        assert.deepEqual(result, before)
        return result
      }
    )
    for (let index = 1; index < names.length; index++) {
      await step(
        `Save and verify part ${index} through native Files`,
        async () => {
          await driver.share(
            `Share/save part ${index}`,
            'ArtBot Backups',
            async () =>
              (await savedInventory(sourceFolder)).includes(names[index])
          )
          if (index === 1) {
            const damaged = Buffer.from(
              await readFile(path.join(sourceFolder, names[index]))
            )
            damaged[Math.floor(damaged.length / 2)] ^= 1
            await receive(source, 'ArtBot Damaged', names[index], damaged)
            const before = await driver.audit(auditLibrary)
            await chooseFiles('Verify saved backup', 'ArtBot Damaged', [
              names[index]
            ])
            await driver.waitWeb(
              'damaged saved part rejected',
              bodyHas('Missing or damaged backup file:')
            )
            assert.deepEqual(await driver.audit(auditLibrary), before)
          }
          await verify(
            [names[index]],
            index === names.length - 1
              ? 'Saved backup verified:'
              : `Verified ${index + 1} of ${names.length} saved files.`
          )
        }
      )
    }
    await step('Audit external saved set and stop the source app', async () => {
      assert.deepEqual(
        await savedInventory(sourceFolder),
        [...names].sort(),
        'Save exactly the backup files, without text.txt or duplicates'
      )
      const hashes = {}
      for (const name of names) {
        const bytes = await readFile(path.join(sourceFolder, name))
        hashes[name] = createHash('sha256').update(bytes).digest('hex')
        const part = manifest.parts.find((entry) => entry.name === name)
        if (part) {
          assert.equal(bytes.length, part.size)
          assert.equal(hashes[name], part.sha256)
        }
      }
      await mkdir(path.join(directory, 'saved-files'))
      for (const name of names)
        await copyFile(
          path.join(sourceFolder, name),
          path.join(directory, 'saved-files', name)
        )
      await driver.mobile('mobile: terminateApp', {
        bundleId: 'com.apple.webapp'
      })
      await driver.stop()
      driver = undefined
      await simctl('shutdown', source.id)
      return { names, hashes, sourceShutDown: true }
    })
  }
  const destination = await startDevice('destination')
  if (source) assert.notEqual(destination.id, source.id)
  await step(
    'Prove destination has no source database or preparation state',
    async () => {
      const result = await driver.audit(auditLibrary)
      assertFresh(result)
      assert.equal(result.standalone, true)
      assert.equal(result.secure, true)
      for (const name of names)
        await receive(
          destination,
          'ArtBot Backups',
          name,
          await readFile(path.join(directory, 'saved-files', name))
        )
      for (const name of names) {
        const bytes = Buffer.from(
          await readFile(path.join(directory, 'saved-files', name))
        )
        if (name === names[1]) bytes[Math.floor(bytes.length / 2)] ^= 1
        await receive(destination, 'ArtBot Damaged', name, bytes)
      }
      // Native transfer must not manufacture any application preparation or
      // library state. Enter the ordinary backup page after receiving files.
      assert.deepEqual(await driver.audit(auditLibrary), result)
      for (const folder of ['ArtBot Backups', 'ArtBot Damaged'])
        assert.deepEqual(
          await savedInventory(path.join(destination.files, folder)),
          [...names].sort()
        )
      await driver.settings()
      return result
    }
  )
  await step('Verify external backup without a local preparation', async () => {
    await verify(names, 'Saved backup verified:')
    const result = await driver.audit(auditLibrary)
    assertFresh(result)
    return result
  })
  await step(
    'Restore only saved files in the fresh installed app',
    async () => {
      await chooseFiles('Choose backup files', 'ArtBot Backups', names)
      await driver.scrollButton('Restore library')
      await driver.button('Restore library')
      await driver.waitWeb(
        'fresh restore completed',
        bodyHas('ArtBot database imported!')
      )
      const result = await driver.audit(auditLibrary)
      assertFixture(result, fixture.expected)
      assert.equal(result.preparations, 0)
      return result
    }
  )
  await step(
    'Retain the restored library after Home Screen relaunch',
    async () => {
      await driver.reopen()
      const result = await driver.audit(auditLibrary)
      assertFixture(result, fixture.expected)
      await driver.settings()
      return result
    }
  )
  const originalDestination = await driver.audit(auditLibrary)
  await step(
    'Cancel native restore picker while preserving the populated library',
    async () => {
      await driver.cancelFiles('Choose backup files')
      assert.deepEqual(await driver.audit(auditLibrary), originalDestination)
      return { selectedLibrary: originalDestination.name, retained: true }
    }
  )
  for (const scenario of [
    {
      label: 'missing part',
      folder: 'ArtBot Backups',
      files: names.slice(0, -1),
      error: 'Missing, duplicate or unexpected backup files'
    },
    {
      label: 'damaged part',
      folder: 'ArtBot Damaged',
      files: names,
      error: 'Missing or damaged backup part 1'
    }
  ]) {
    await step(
      `Reject ${scenario.label} in verification and restore without losing the populated library`,
      async () => {
        await chooseFiles(
          'Verify saved backup',
          scenario.folder,
          scenario.files
        )
        await driver.waitWeb(
          'verification rejected invalid saved files',
          statusHas('Back up this library', scenario.error)
        )
        assert.deepEqual(await driver.audit(auditLibrary), originalDestination)
        await chooseFiles(
          'Choose backup files',
          scenario.folder,
          scenario.files
        )
        await driver.waitWeb(
          'restore inventory preflight finished',
          'const preview=document.querySelector("[data-backup-preflight]");return preview && preview.dataset.backupPreflight!=="checking"'
        )
        const blockedByPreview = await driver.web(
          'return [...document.querySelectorAll("button")].find(b=>b.textContent.trim()==="Restore library").disabled'
        )
        if (!blockedByPreview) {
          await driver.scrollButton('Restore library')
          await driver.button('Restore library')
        }
        await driver.waitWeb(
          'restore rejected invalid saved files',
          statusHas('Restore a library', 'Unable to import this database.')
        )
        try {
          await driver.waitWeb(
            'specific restore error',
            statusHas(
              'Restore a library',
              scenario.label === 'damaged part'
                ? [scenario.error, 'A selected backup file could not be read.']
                : scenario.error
            )
          )
        } catch (error) {
          report.fileAccessFailure = await driver
            .audit(async () => {
              const result = []
              for (const input of document.querySelectorAll(
                'input[type="file"]'
              )) {
                for (const file of input.files) {
                  const entry = {
                    input: input.getAttribute('aria-label'),
                    name: file.name,
                    size: file.size
                  }
                  try {
                    await file.slice(0, 1).arrayBuffer()
                    entry.readable = true
                  } catch (error) {
                    entry.error = { name: error.name, message: error.message }
                  }
                  result.push(entry)
                }
              }
              return result
            })
            .catch((error) => ({ diagnosticError: error.message }))
          throw error
        }
        const result = await driver.audit(auditLibrary)
        assert.deepEqual(result, originalDestination)
        const observedRestoreError = await driver.web(
          `const panel=[...document.querySelectorAll('h3')].find(h=>h.textContent.trim()==='Restore a library').parentElement;return panel.querySelector('[role="status"]').textContent`
        )
        if (
          observedRestoreError.includes(
            'A selected backup file could not be read.'
          )
        ) {
          assert.match(observedRestoreError, /Choose the saved files again/)
          assert.match(observedRestoreError, /close and reopen ArtBot/)
        }
        const selectedFiles = observedRestoreError.includes('could not be read')
          ? await selectedFileAccess()
          : undefined
        return {
          selectedLibrary: result.name,
          retained: true,
          expectedError: scenario.error,
          blockedByPreview,
          observedRestoreError,
          selectedFiles
        }
      }
    )
  }
  await step(
    'Cold reopen and reject the readable damaged backup by checksum',
    async () => {
      await driver.reopen()
      assert.deepEqual(await driver.audit(auditLibrary), originalDestination)
      await driver.settings()
      await chooseFiles('Choose backup files', 'ArtBot Damaged', names)
      await driver.scrollButton('Restore library')
      await driver.button('Restore library')
      await driver.waitWeb(
        'cold restore checks the actual damaged bytes',
        statusHas('Restore a library', 'Missing or damaged backup part 1')
      )
      const result = await driver.audit(auditLibrary)
      assert.deepEqual(result, originalDestination)
      return {
        selectedLibrary: result.name,
        checksumRejected: true,
        retained: true
      }
    }
  )
  await step(
    'Reopen after failed restores and retry the valid external backup',
    async () => {
      await driver.reopen()
      assert.deepEqual(await driver.audit(auditLibrary), originalDestination)
      await driver.settings()
      await chooseFiles('Choose backup files', 'ArtBot Backups', names)
      await driver.scrollButton('Restore library')
      await driver.button('Restore library')
      await driver.waitWeb(
        'valid retry selected a new library',
        `return window._artbotDb?.name && window._artbotDb.name !== ${JSON.stringify(
          originalDestination.name
        )}`
      )
      const result = await driver.audit(auditLibrary)
      assertFixture(result, fixture.expected)
      return result
    }
  )
  await step(
    'Rollback valid retry returns to the preserved populated library',
    async () => {
      await driver.scrollButton('Return to previous library')
      await driver.button('Return to previous library')
      await driver.waitWeb(
        'previous populated library selected',
        `return window._artbotDb?.name === ${JSON.stringify(
          originalDestination.name
        )}`
      )
      const result = await driver.audit(auditLibrary)
      assertFixture(result, fixture.expected)
      return result
    }
  )
  await step(
    'Rollback returns the destination to its empty library',
    async () => {
      await driver.scrollButton('Return to previous library')
      await driver.button('Return to previous library')
      await driver.waitWeb(
        'original library selected',
        'return window._artbotDb?.name === "imageHorde"'
      )
      const result = await driver.audit(auditLibrary)
      assert.equal(result.name, 'imageHorde')
      assert.ok(Object.values(result.counts).every((count) => count === 0))
      assert.equal(result.preparations, 0)
      assert.equal(result.handoff, null)
      assert.equal(result.favoriteLoras, null)
      return result
    }
  )
  report.status = 'passed'
} catch (error) {
  report.status = 'failed'
  report.error = error.stack
  console.error(error.message)
  process.exitCode = 1
} finally {
  await cleanup()
  console.log(
    `[iOS PWA] ${report.status.toUpperCase()}: ${path.join(
      directory,
      'report.json'
    )}`
  )
}
