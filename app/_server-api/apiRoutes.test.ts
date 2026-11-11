/**
 * Tests for the Next API routes. They live outside pages/ because Next would
 * serve any file in that directory as a route.
 */
import { execFileSync } from 'child_process'
import * as crypto from 'crypto'
import jwt from 'jsonwebtoken'
import sharp from 'sharp'

const SECRET = 'test-secret'
const SALT = 'test-salt'
const PASSWORD = 'correct-password'

process.env.SECRET = SECRET
process.env.SALT = SALT
process.env.ADMIN_USER = 'admin'
process.env.ADMIN_PW_HASH = crypto
  .createHash('sha256')
  .update(PASSWORD + SALT)
  .digest('hex')

// Loaded with require so the environment above is set before adminTools reads it.
const adminTools = require('app/_server-api/adminTools')
const { resetImageImportLimits } = require('app/_server-api/imageImportLimits')
const { resetLoginRateLimit } = require('app/_server-api/loginRateLimit')
const remoteImage = require('app/_server-api/fetchRemoteImage')
const imgFromUrl = require('pages/api/img-from-url').default
const login = require('pages/api/admin/login').default
const updateSettings = require('pages/api/admin/update-settings').default

const callRoute = async (handler: any, request: any) => {
  const result: { statusCode: number; body?: any; responded: boolean } = {
    statusCode: 200,
    responded: false
  }

  const finish = (body: any) => {
    result.body = body
    result.responded = true
    return res
  }

  const res = {
    setHeader: jest.fn(),
    status(code: number) {
      result.statusCode = code
      return res
    },
    json: finish,
    send: finish
  }

  await handler({ headers: {}, query: {}, ...request }, res)
  return result
}

const adminToken = () =>
  jwt.sign({ username: 'admin' }, SECRET, { expiresIn: '6h' })
const authorized = (token = adminToken()) => ({
  headers: { authorization: token }
})

const fetchMock = jest.fn()

beforeEach(() => {
  fetchMock.mockReset()
  resetLoginRateLimit()
  resetImageImportLimits()
  global.fetch = fetchMock as any
  jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('/api/img-from-url', () => {
  const pngOfSize = (width: number, height: number) =>
    sharp({
      create: { width, height, channels: 3, background: 'red' }
    })
      .png()
      .toBuffer()

  const serveImage = (body: Buffer) =>
    jest
      .spyOn(remoteImage, 'fetchRemoteImage')
      .mockResolvedValue({ body, contentType: 'image/png' })

  const failFetchWith = (code: string) =>
    jest
      .spyOn(remoteImage, 'fetchRemoteImage')
      .mockRejectedValue(new remoteImage.RemoteImageError(code))

  const post = (body: object) => callRoute(imgFromUrl, { method: 'POST', body })

  const url = 'https://images.example.com/cat.png'

  it('rejects other HTTP methods', async () => {
    const result = await callRoute(imgFromUrl, { method: 'GET' })
    expect(result.statusCode).toBe(400)
  })

  it('returns a remote image as base64', async () => {
    serveImage(await pngOfSize(64, 32))

    const { body } = await post({ imageUrl: url })

    expect(body).toMatchObject({
      success: true,
      imageType: 'image/png',
      width: 64,
      height: 32
    })
    expect(Buffer.from(body.imgBase64String, 'base64').length).toBeGreaterThan(
      0
    )
  })

  it('shrinks large images to fit 1024px', async () => {
    serveImage(await pngOfSize(2048, 1024))

    const { body } = await post({ imageUrl: url })

    expect(body).toMatchObject({ success: true, width: 1024, height: 512 })
  })

  it('keeps full size for R2 images', async () => {
    serveImage(await pngOfSize(2048, 1024))

    const { body } = await post({ imageUrl: url, r2: true })

    expect(body).toMatchObject({ success: true, width: 2048, height: 1024 })
  })

  it.each([
    ['TOO_LARGE', 'ERROR_IMAGE_SIZE'],
    ['FETCH_FAILED', 'UNABLE_TO_FETCH_IMAGE'],
    ['BLOCKED_ADDRESS', 'INVALID_IMAGE_URL'],
    ['INVALID_URL', 'INVALID_IMAGE_URL']
  ])('reports %s as %s', async (code, status) => {
    failFetchWith(code)

    const { body } = await post({ imageUrl: url })

    expect(body).toEqual({ success: false, status })
  })

  it('caps downloads at 10 MB', async () => {
    const fetchImage = serveImage(await pngOfSize(8, 8))

    await post({ imageUrl: url })

    expect(fetchImage).toHaveBeenCalledWith(url, { maxBytes: 10000000 })
  })

  it.each([
    'http://127.0.0.1:3000/admin',
    'http://169.254.169.254/latest/meta-data/',
    'http://10.0.0.5/private.png',
    'http://192.168.1.1/router.png',
    'http://[::1]/internal',
    'file:///etc/passwd',
    undefined
  ])('refuses to fetch %s', async (imageUrl) => {
    const { body } = await post({ imageUrl })

    expect(body).toEqual({ success: false, status: 'INVALID_IMAGE_URL' })
  })

  it('rejects oversized dimensions before invoking sharp even for R2 imports', async () => {
    const png = await pngOfSize(8, 8)
    png.writeUInt32BE(16384, 16)
    png.writeUInt32BE(16384, 20)
    serveImage(png)
    expect((await post({ imageUrl: url, r2: true })).body).toEqual({
      success: false,
      status: 'ERROR_IMAGE_SIZE'
    })
  })

  it('limits repeated imports per client before starting another download', async () => {
    const fetchImage = failFetchWith('FETCH_FAILED')
    for (let i = 0; i < 30; i++) await post({ imageUrl: url })
    const throttled = await post({ imageUrl: url })
    expect(throttled.statusCode).toBe(429)
    expect(fetchImage).toHaveBeenCalledTimes(30)
    expect(
      (
        await callRoute(imgFromUrl, {
          method: 'POST',
          body: { imageUrl: url },
          socket: { remoteAddress: '203.0.113.2' }
        })
      ).statusCode
    ).toBe(200)
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 61000)
    expect((await post({ imageUrl: url })).statusCode).toBe(200)
  })

  it('caps active downloads and releases capacity after errors', async () => {
    const release: ((error: Error) => void)[] = []
    const fetchImage = jest
      .spyOn(remoteImage, 'fetchRemoteImage')
      .mockImplementation(
        () =>
          new Promise((_resolve, reject) => {
            release.push(reject)
          })
      )
    const one = post({ imageUrl: url })
    const two = post({ imageUrl: url })
    expect((await post({ imageUrl: url })).statusCode).toBe(429)
    expect(fetchImage).toHaveBeenCalledTimes(2)
    release.forEach((reject) => reject(new Error('Download failed')))
    await Promise.all([one, two])
    fetchImage.mockRejectedValue(new Error('Download failed'))
    expect((await post({ imageUrl: url })).statusCode).toBe(200)
  })

  it('reports a failure for a non-image response', async () => {
    serveImage(Buffer.from('<html>not an image</html>'))

    const { body } = await post({ imageUrl: url })

    expect(body).toEqual({
      success: false,
      status: 'ERROR_RESIZING_REMOTE_IMAGE'
    })
  })
})

describe('/api/admin/login', () => {
  const attempt = (username: string, password: string) =>
    callRoute(login, {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })

  it('rejects other HTTP methods', async () => {
    expect((await callRoute(login, { method: 'GET' })).statusCode).toBe(400)
  })

  it('issues a working token for correct credentials', async () => {
    const { body } = await attempt('admin', PASSWORD)

    expect(body.success).toBe(true)
    expect(await adminTools.validateToken(body.token)).toBe(true)
  })

  it.each([
    ['a wrong password', 'admin', 'wrong'],
    ['an unknown user', 'someone', PASSWORD]
  ])('rejects %s', async (_name, username, password) => {
    const { body } = await attempt(username, password)

    expect(body.success).toBe(false)
    expect(body.token).toBeUndefined()
  })

  it('confirms an existing valid token', async () => {
    const token = adminToken()

    const { body } = await callRoute(login, {
      method: 'POST',
      ...authorized(token)
    })

    expect(body).toEqual({ success: true, token })
  })

  it('does not confirm an invalid token', async () => {
    const { body } = await callRoute(login, {
      method: 'POST',
      ...authorized('not-a-token')
    })

    expect(body.success).toBe(false)
  })
})

describe('admin login protection', () => {
  const attempt = (
    password: unknown,
    client = '203.0.113.1',
    username: unknown = 'admin'
  ) =>
    callRoute(login, {
      method: 'POST',
      headers: { 'x-forwarded-for': client },
      socket: { remoteAddress: '127.0.0.1' },
      body: JSON.stringify({ username, password })
    })

  const failFromClient = async (times: number, client = '203.0.113.1') => {
    for (let i = 0; i < times; i++) {
      await attempt('wrong', client)
    }
  }

  it('allows four failed attempts', async () => {
    await failFromClient(4)

    expect((await attempt(PASSWORD)).body.success).toBe(true)
  })

  it('blocks a client after five failures, even with the right password', async () => {
    await failFromClient(5)

    const result = await attempt(PASSWORD)

    expect(result.statusCode).toBe(429)
    expect(result.body).toEqual({ success: false })
  })

  it('does not block other clients', async () => {
    await failFromClient(5)

    expect((await attempt(PASSWORD, '203.0.113.2')).body.success).toBe(true)
  })

  it('clears failures after a successful login', async () => {
    await failFromClient(4)
    await attempt(PASSWORD)
    await failFromClient(4)

    expect((await attempt(PASSWORD)).body.success).toBe(true)
  })

  it('keeps an unrelated administrator usable after failures from many clients', async () => {
    for (let i = 0; i < 50; i++) {
      await attempt('wrong', `198.51.100.${i}`)
    }

    expect((await attempt(PASSWORD, '203.0.113.9')).body.success).toBe(true)
  })

  it('does not trust forwarding headers on a direct public connection', async () => {
    const direct = (password: string, index: number) =>
      callRoute(login, {
        method: 'POST',
        socket: { remoteAddress: '203.0.113.8' },
        headers: {
          'x-forwarded-for': `198.51.100.${index}`,
          'x-real-ip': `198.51.100.${index}`
        },
        body: JSON.stringify({ username: 'admin', password })
      })
    for (let i = 0; i < 5; i++) await direct('wrong', i)
    expect((await direct(PASSWORD, 99)).statusCode).toBe(429)
  })

  it('keys proxy requests on its last forwarded hop, ignoring a spoofed prefix', async () => {
    const proxied = (password: string, index: number) =>
      callRoute(login, {
        method: 'POST',
        socket: { remoteAddress: '::ffff:127.0.0.1' },
        headers: { 'x-forwarded-for': `198.51.100.${index}, 203.0.113.8` },
        body: JSON.stringify({ username: 'admin', password })
      })
    for (let i = 0; i < 5; i++) await proxied('wrong', i)
    expect((await proxied(PASSWORD, 99)).statusCode).toBe(429)
  })

  it('ignores a forged real-IP header when nginx appends the actual client', async () => {
    const proxied = (password: string, real: string, prefix: number) =>
      callRoute(login, {
        method: 'POST',
        socket: { remoteAddress: '127.0.0.1' },
        headers: {
          'x-real-ip': `198.51.100.${prefix}`,
          'x-forwarded-for': `198.51.100.${prefix}, ${real}`
        },
        body: JSON.stringify({ username: 'admin', password })
      })
    for (let i = 0; i < 5; i++) await proxied('wrong', '203.0.113.8', i)
    expect((await proxied(PASSWORD, '203.0.113.8', 99)).statusCode).toBe(429)
    expect((await proxied(PASSWORD, '203.0.113.9', 99)).body.success).toBe(true)
  })

  it('unblocks after the window passes', async () => {
    await failFromClient(5)
    const now = Date.now()
    jest.spyOn(Date, 'now').mockReturnValue(now + 16 * 60 * 1000)

    expect((await attempt(PASSWORD)).body.success).toBe(true)
  })

  it('rejects a malformed request body', async () => {
    const result = await callRoute(login, { method: 'POST', body: '{nope' })

    expect(result.statusCode).toBe(400)
  })

  it.each([[{ a: 1 }], [null], [undefined], [123]])(
    'rejects the non-string password %p',
    async (password) => {
      expect((await attempt(password)).body.success).toBe(false)
    }
  )

  describe('when the admin account is not configured', () => {
    const { ADMIN_USER, ADMIN_PW_HASH } = process.env

    afterEach(() => {
      process.env.ADMIN_USER = ADMIN_USER
      process.env.ADMIN_PW_HASH = ADMIN_PW_HASH
    })

    it('refuses a login with no username', async () => {
      delete process.env.ADMIN_USER

      const result = await callRoute(login, {
        method: 'POST',
        body: JSON.stringify({ password: PASSWORD })
      })

      expect(result.body.success).toBe(false)
    })

    it('refuses every password when no hash is set', async () => {
      delete process.env.ADMIN_PW_HASH

      expect((await attempt('')).body.success).toBe(false)
      expect((await attempt('undefined')).body.success).toBe(false)
    })
  })

  describe('with a scrypt password hash', () => {
    const legacyHash = process.env.ADMIN_PW_HASH
    let scryptHash: string

    beforeAll(() => {
      scryptHash = execFileSync(
        process.execPath,
        ['x-build-scripts/hashAdminPassword.js'],
        { input: `${PASSWORD}\n`, encoding: 'utf8' }
      ).trim()
    })

    beforeEach(() => {
      process.env.ADMIN_PW_HASH = scryptHash
    })

    afterEach(() => {
      process.env.ADMIN_PW_HASH = legacyHash
    })

    it('generates a salted hash without a $ character', () => {
      expect(scryptHash).toMatch(/^scrypt:[0-9a-f]{32}:[0-9a-f]{128}$/)
    })

    it('accepts the right password', async () => {
      expect((await attempt(PASSWORD)).body.success).toBe(true)
    })

    it('rejects a wrong password', async () => {
      expect((await attempt('wrong')).body.success).toBe(false)
    })

    it('rejects a truncated stored hash', async () => {
      process.env.ADMIN_PW_HASH = 'scrypt:abc'

      expect((await attempt(PASSWORD)).body.success).toBe(false)
    })
  })
})

describe('token validation', () => {
  it.each([
    ['is missing', ''],
    ['is garbage', 'garbage'],
    ['is signed with another secret', jwt.sign({ username: 'admin' }, 'other')],
    [
      'has expired',
      jwt.sign({ username: 'admin' }, SECRET, { expiresIn: -10 })
    ],
    ['belongs to another user', jwt.sign({ username: 'other' }, SECRET)],
    [
      'uses no signature',
      jwt.sign({ username: 'admin' }, '', { algorithm: 'none' })
    ]
  ])('rejects a token that %s', async (_name, token) => {
    expect(await adminTools.validateToken(token)).toBe(false)
  })

  describe('when ADMIN_USER is not set', () => {
    const { ADMIN_USER } = process.env

    beforeEach(() => {
      delete process.env.ADMIN_USER
    })

    afterEach(() => {
      process.env.ADMIN_USER = ADMIN_USER
    })

    it.each([
      ['has no username', jwt.sign({ role: 'admin' }, SECRET)],
      ['has an empty username', jwt.sign({ username: '' }, SECRET)],
      ['is a signed string', jwt.sign('admin', SECRET)]
    ])('rejects a signed token that %s', async (_name, token) => {
      expect(await adminTools.validateToken(token)).toBe(false)
    })
  })
})

describe('/api/admin/update-settings', () => {
  let writeSettings: jest.SpyInstance

  beforeEach(() => {
    writeSettings = jest
      .spyOn(adminTools, 'updateServerSettingsFile')
      .mockResolvedValue(undefined as never)
  })

  it('saves settings for an admin', async () => {
    const { body } = await callRoute(updateSettings, {
      method: 'POST',
      ...authorized(),
      body: JSON.stringify({ message: 'hello' })
    })

    expect(body.success).toBe(true)
    expect(writeSettings).toHaveBeenCalledWith({ message: 'hello' })
  })

  it('does not save settings without a valid token', async () => {
    await callRoute(updateSettings, {
      method: 'POST',
      ...authorized('bad-token'),
      body: JSON.stringify({ message: 'hacked' })
    })

    expect(writeSettings).not.toHaveBeenCalled()
  })

  it('reports failure without a valid token', async () => {
    const { body } = await callRoute(updateSettings, {
      method: 'POST',
      ...authorized('bad-token'),
      body: JSON.stringify({ message: 'hacked' })
    })

    expect(body.success).toBe(false)
  })
})
