import { spawn, execFile } from 'node:child_process'
import { promisify } from 'node:util'
import {
  mkdir,
  readFile,
  writeFile,
  copyFile,
  readdir,
  access,
  open
} from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import net from 'node:net'
import http from 'node:http'
import https from 'node:https'
import { fileURLToPath } from 'node:url'
import { once } from 'node:events'
import { poll } from './driver.mjs'

const exec = promisify(execFile)
const children = new Set()
export async function stopChildren() {
  for (const owned of children) await owned.stop()
}
export const repo = fileURLToPath(new URL('../../', import.meta.url))
const tool = fileURLToPath(new URL('./', import.meta.url))
export const command = async (file, args, options = {}) =>
  (await exec(file, args, { maxBuffer: 8 * 1048576, ...options })).stdout.trim()
export const simctl = (...args) => command('xcrun', ['simctl', ...args])
export async function freePort() {
  const server = net.createServer()
  await new Promise((resolve, reject) =>
    server.listen(0, '127.0.0.1', resolve).once('error', reject)
  )
  const { port } = server.address()
  await new Promise((resolve) => server.close(resolve))
  return port
}
export async function child(file, args, logfile, options = {}) {
  const log = await open(logfile, 'a')
  const process = spawn(file, args, {
    ...options,
    stdio: ['ignore', log.fd, log.fd]
  })
  await log.close()
  // Observe spawn errors immediately, including before a readiness check.
  let error
  process.on('error', (value) => {
    error = value
  })
  const owned = {
    process,
    check() {
      if (error) throw error
      if (process.exitCode !== null || process.signalCode !== null)
        throw Error(
          `${file} exited ${
            process.exitCode ?? process.signalCode
          }; see ${logfile}`
        )
    },
    async stop() {
      if (
        process.exitCode !== null ||
        process.signalCode !== null ||
        !process.pid
      )
        return
      process.kill('SIGTERM')
      let timer
      try {
        await Promise.race([
          once(process, 'exit'),
          new Promise((resolve) => {
            timer = setTimeout(() => {
              process.kill('SIGKILL')
              resolve()
            }, 5000)
            timer.unref()
          })
        ])
      } finally {
        clearTimeout(timer)
      }
    }
  }
  children.add(owned)
  return owned
}

export async function buildArtifact(directory) {
  const destination = path.join(directory, 'application')
  await mkdir(destination)
  const files = (
    await command(
      'git',
      ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
      { cwd: repo }
    )
  )
    .split('\0')
    .filter(Boolean)
  for (const name of files) {
    if (
      name.startsWith('.env') ||
      name.startsWith('.git/') ||
      name.includes('/node_modules/')
    )
      continue
    await mkdir(path.dirname(path.join(destination, name)), { recursive: true })
    await copyFile(path.join(repo, name), path.join(destination, name))
  }
  await writeFile(path.join(destination, '.env'), '')
  // APFS clone: isolated build/dependencies without copying the user's .env.
  await command('cp', [
    '-cR',
    path.join(repo, 'node_modules'),
    path.join(destination, 'node_modules')
  ])
  await command(process.execPath, ['x-build-scripts/updateBuildId.js'], {
    cwd: destination
  })
  await mkdir(path.join(directory, 'server-data'), { recursive: true })
  const build = await child(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'build'],
    path.join(directory, 'build.log'),
    {
      cwd: destination,
      env: {
        ...process.env,
        BASE_PATH: '/artbot',
        NEXT_TELEMETRY_DISABLED: '1',
        ARTBOT_TEST_DATA_DIR: path.join(directory, 'server-data'),
        NODE_OPTIONS: `--require ${JSON.stringify(
          path.join(repo, 'scripts/upgrade-comparison/server-sandbox.cjs')
        )}`
      }
    }
  )
  const [code] = await once(build.process, 'exit')
  if (code !== 0)
    throw Error(`Production build failed; see ${directory}/build.log`)
  return destination
}

export async function serve(build, directory) {
  await access(path.join(build, 'build/BUILD_ID'))
  await mkdir(path.join(directory, 'server-data'), { recursive: true })
  const key = path.join(directory, 'test-key.pem'),
    cert = path.join(directory, 'test-cert.pem')
  await command('openssl', [
    'req',
    '-x509',
    '-newkey',
    'rsa:2048',
    '-nodes',
    '-days',
    '2',
    '-keyout',
    key,
    '-out',
    cert,
    '-subj',
    '/CN=ArtBot Disposable Simulator',
    '-addext',
    'subjectAltName=DNS:localhost,IP:127.0.0.1',
    '-addext',
    'basicConstraints=critical,CA:TRUE'
  ])
  const port = await freePort()
  const backend = await child(
    process.execPath,
    [
      'node_modules/next/dist/bin/next',
      'start',
      '--hostname',
      '127.0.0.1',
      '--port',
      String(port)
    ],
    path.join(directory, 'application.log'),
    {
      cwd: build,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        BASE_PATH: '/artbot',
        NEXT_TELEMETRY_DISABLED: '1',
        ARTBOT_TEST_DATA_DIR: path.join(directory, 'server-data'),
        NODE_OPTIONS: `--require ${JSON.stringify(
          path.join(repo, 'scripts/upgrade-comparison/server-sandbox.cjs')
        )}`
      }
    }
  )
  let front
  try {
    await poll('isolated application startup', async () => {
      backend.check()
      return (
        await fetch(`http://127.0.0.1:${port}/artbot/api/server-info`, {
          signal: AbortSignal.timeout(2000)
        })
      ).ok
    })
    const buildInfo = await (
      await fetch(`http://127.0.0.1:${port}/artbot/api/server-info`)
    ).json()
    const json = (response, value) =>
      response
        .writeHead(200, { 'Content-Type': 'application/json' })
        .end(JSON.stringify(value))
    front = https.createServer(
      { key: await readFile(key), cert: await readFile(cert) },
      (request, response) => {
        const url = new URL(request.url, 'https://localhost')
        if (url.pathname === '/artbot' && !url.searchParams.has('backup_lab')) {
          url.searchParams.set('backup_lab', '1')
          response.writeHead(302, { Location: url.pathname + url.search }).end()
          return
        }
        if (
          url.pathname !== '/artbot' &&
          !url.pathname.startsWith('/artbot/')
        ) {
          response.writeHead(404).end()
          return
        }
        // Test data only; the native app cannot contact Horde or another service.
        if (
          url.pathname.startsWith('/artbot/api/') &&
          url.pathname !== '/artbot/api/server-info'
        ) {
          if (url.pathname.endsWith('/models/available'))
            json(response, {
              success: true,
              models: [
                {
                  name: 'Deliberate',
                  count: 1,
                  performance: 1,
                  queued: 0,
                  eta: 0,
                  type: 'image'
                }
              ]
            })
          else if (url.pathname.endsWith('/models/details'))
            json(response, {
              success: true,
              models: {
                Deliberate: {
                  name: 'Deliberate',
                  baseline: 'stable diffusion 1',
                  type: 'ckpt'
                }
              }
            })
          else json(response, { success: true })
          return
        }
        const upstream = http.request(
          {
            hostname: '127.0.0.1',
            port,
            path: request.url,
            method: request.method,
            headers: { ...request.headers, 'x-forwarded-proto': 'https' }
          },
          (reply) => {
            response.writeHead(reply.statusCode, {
              ...reply.headers,
              'Content-Security-Policy':
                "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data: blob:; font-src 'self' data:; worker-src 'self' blob:"
            })
            reply.pipe(response)
          }
        )
        upstream.on('error', () => {
          response.writeHead(502).end()
        })
        request.pipe(upstream)
      }
    )
    await new Promise((resolve) => front.listen(0, '127.0.0.1', resolve))
    return {
      origin: `https://localhost:${front.address().port}`,
      cert,
      buildInfo,
      async stop() {
        front.closeAllConnections()
        await new Promise((resolve) => front.close(resolve))
        await backend.stop()
      }
    }
  } catch (error) {
    if (front) front.close()
    await backend.stop()
    throw error
  }
}

export async function startAppium(directory) {
  const main = path.join(tool, 'node_modules/appium/build/lib/main.js')
  try {
    await access(main)
  } catch {
    throw Error(
      'Install native test tools first: npm ci --prefix scripts/ios-pwa'
    )
  }
  const home = path.join(repo, '__local_db/ios-pwa-tools/home')
  await mkdir(home, { recursive: true })
  const env = { ...process.env, APPIUM_HOME: home }
  const installed = JSON.parse(
    await command(
      process.execPath,
      [main, 'driver', 'list', '--installed', '--json'],
      { env }
    )
  )
  if (installed.xcuitest && installed.xcuitest.version !== '12.22.8')
    throw Error(
      'Native tool cache has a different XCUITest version; use a fresh ios-pwa-tools directory'
    )
  if (!installed.xcuitest)
    await command(
      process.execPath,
      [
        main,
        'driver',
        'install',
        '--source=local',
        path.join(tool, 'node_modules/appium-xcuitest-driver')
      ],
      { env }
    )
  const port = await freePort(),
    address = `http://127.0.0.1:${port}`
  const server = await child(
    process.execPath,
    [main, '--address', '127.0.0.1', '--port', String(port), '--log-no-colors'],
    path.join(directory, 'appium.log'),
    { env }
  )
  try {
    await poll('Appium startup', async () => {
      server.check()
      return (await fetch(`${address}/status`)).ok
    })
  } catch (error) {
    await server.stop()
    throw error
  }
  return {
    address,
    stop: () => server.stop(),
    derivedData: path.join(repo, '__local_db/ios-pwa-tools/derived-data')
  }
}

export async function chooseRuntime(requested) {
  if (process.platform !== 'darwin')
    throw Error('Native PWA tests require macOS and Xcode')
  const { runtimes } = JSON.parse(await simctl('list', 'runtimes', '-j'))
  const available = runtimes
    .filter((entry) => entry.isAvailable && entry.name.startsWith('iOS '))
    .sort((a, b) =>
      b.version.localeCompare(a.version, undefined, { numeric: true })
    )
  const runtime = requested
    ? available.find((entry) => entry.identifier === requested)
    : available[0]
  if (!runtime)
    throw Error(
      'Install an iOS Simulator runtime in Xcode; --runtime accepts an installed runtime identifier'
    )
  return runtime
}
export async function createDevice(name, runtime, cert, created) {
  const id = await simctl(
    'create',
    name,
    'com.apple.CoreSimulator.SimDeviceType.iPhone-16',
    runtime.identifier
  )
  try {
    await created(id)
    await simctl('boot', id)
    await simctl('bootstatus', id, '-b')
    await simctl('keychain', id, 'add-root-cert', cert)
    await simctl('launch', id, 'com.apple.DocumentsApp')
    const groups = await simctl(
      'get_app_container',
      id,
      'com.apple.DocumentsApp',
      'groups'
    )
    const provider = groups
      .split('\n')
      .find((line) =>
        line.startsWith('group.com.apple.FileProvider.LocalStorage\t')
      )
      ?.split('\t')[1]
    if (!provider) throw Error('The disposable Files provider was not found')
    return { id, files: path.join(provider, 'File Provider Storage') }
  } catch (error) {
    // The caller recorded ownership before boot and handles cleanup, including
    // partial setup and signals. Never scan or delete pre-existing devices.
    throw error
  }
}
export async function savedInventory(folder) {
  return (await readdir(folder)).filter((name) => !name.startsWith('.')).sort()
}
export const platform = { host: os.platform(), architecture: os.arch() }
