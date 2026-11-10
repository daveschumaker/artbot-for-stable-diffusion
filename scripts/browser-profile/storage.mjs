import {
  cp,
  mkdir,
  readFile,
  writeFile,
  rm,
  lstat,
  readdir,
  mkdtemp
} from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { createHash } from 'node:crypto'
import { chromium } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { setTimeout } from 'node:timers/promises'
import path from 'node:path'

export function validateName(name) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(name ?? ''))
    throw new Error(
      'Use a short baseline name containing letters, numbers, hyphens or underscores.'
    )
  return name
}

export async function browserIdentity() {
  const executable = chromium.executablePath()
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(executable)) hash.update(chunk)
  return {
    executable,
    version: execFileSync(executable, ['--version'], { encoding: 'utf8' })
      .trim()
      .match(/\d+\.\d+\.\d+\.\d+/)?.[0],
    sha256: hash.digest('hex'),
    platform: process.platform,
    arch: process.arch
  }
}

export async function assertCompatible(manifest) {
  const current = await browserIdentity()
  for (const key of ['sha256', 'version', 'platform', 'arch']) {
    if (current[key] !== manifest.browser[key])
      throw new Error(
        `Browser baseline mismatch (${key}). Use the original Playwright browser/OS; do not silently upgrade the baseline.`
      )
  }
}

// Only accepts profiles managed by this tool, and only after the capture
// process closes Chromium. Reject Chromium's live-profile sentinel too.
export async function assertClosed(profile) {
  if (profileProcesses(profile).length)
    throw new Error(
      'Chromium still uses this profile. Wait for all browser processes to exit.'
    )
  try {
    await lstat(path.join(profile, 'SingletonLock'))
    throw new Error(
      'Chromium still has a SingletonLock. Close the browser cleanly before copying.'
    )
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

function profileProcesses(profile) {
  if (!['darwin', 'linux'].includes(process.platform))
    throw new Error(
      'Profile process verification currently supports macOS and Linux only.'
    )
  const marker = `--user-data-dir=${path.resolve(profile)}`
  return execFileSync('ps', ['-axo', 'pid=,command='], { encoding: 'utf8' })
    .split('\n')
    .filter((line) => line.includes(marker))
}

export async function waitForProfileExit(profile) {
  const deadline = Date.now() + 30000
  while (profileProcesses(profile).length) {
    if (Date.now() > deadline)
      throw new Error(
        'Chromium did not fully exit; refusing to snapshot its profile.'
      )
    await setTimeout(100)
  }
  await assertClosed(profile)
}

export async function treeHash(directory) {
  const hash = createHash('sha256')
  async function visit(relative) {
    for (const item of (
      await readdir(path.join(directory, relative), { withFileTypes: true })
    ).sort((a, b) => a.name.localeCompare(b.name))) {
      const name = path.join(relative, item.name)
      if (item.isSymbolicLink())
        throw new Error(`Unexpected symlink in closed profile: ${name}`)
      if (item.isDirectory()) await visit(name)
      else if (item.isFile()) {
        const fileHash = createHash('sha256')
        for await (const chunk of createReadStream(path.join(directory, name)))
          fileHash.update(chunk)
        hash.update(JSON.stringify([name, fileHash.digest('hex')]))
      } else throw new Error(`Unexpected non-file in profile: ${name}`)
    }
  }
  await visit('')
  return hash.digest('hex')
}

export async function saveBaseline({ root, name, profile, browser }) {
  validateName(name)
  await assertClosed(profile)
  const destination = path.join(root, 'baselines', name)
  await mkdir(path.dirname(destination), { recursive: true })
  // Reserve without overwriting an existing immutable baseline.
  await mkdir(destination)
  try {
    await cp(profile, path.join(destination, 'profile'), {
      recursive: true,
      errorOnExist: true,
      force: false
    })
    const sha256 = await treeHash(path.join(destination, 'profile'))
    const manifest = {
      format: 1,
      name,
      origin: 'https://tinybots.net',
      capturedAt: new Date().toISOString(),
      browser,
      profileSha256: sha256
    }
    await writeFile(
      path.join(destination, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    )
    return manifest
  } catch (error) {
    await rm(destination, { recursive: true, force: true })
    throw error
  }
}

export async function cloneBaseline(root, name) {
  validateName(name)
  const source = path.join(root, 'baselines', name)
  const manifest = JSON.parse(
    await readFile(path.join(source, 'manifest.json'), 'utf8')
  )
  if (manifest.format !== 1 || manifest.origin !== 'https://tinybots.net')
    throw new Error('Unsupported baseline manifest.')
  await assertCompatible(manifest)
  await assertClosed(path.join(source, 'profile'))
  if ((await treeHash(path.join(source, 'profile'))) !== manifest.profileSha256)
    throw new Error(
      'Baseline files changed; refusing to use a mutated snapshot.'
    )
  const runs = path.join(root, 'runs')
  await mkdir(runs, { recursive: true })
  const directory = await mkdtemp(path.join(runs, `${name}-`))
  const profile = path.join(directory, 'profile')
  await cp(path.join(source, 'profile'), profile, { recursive: true })
  await writeFile(
    path.join(directory, 'source.json'),
    JSON.stringify(manifest, null, 2)
  )
  return { directory, profile, manifest }
}

export async function acquireCapture(root, name) {
  validateName(name)
  const captures = path.join(root, 'captures')
  await mkdir(captures, { recursive: true, mode: 0o700 })
  const directory = path.join(captures, name)
  await mkdir(directory)
  await writeFile(
    path.join(directory, 'owner.json'),
    JSON.stringify({ pid: process.pid })
  )
  return directory
}
