/**
 * Tests for the Next API routes. They live outside pages/ because Next would
 * serve any file in that directory as a route.
 */
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
process.env.NEXT_SHORTLINK_SERVICE = 'http://shortlinks.test'

// Loaded with require so the environment above is set before adminTools reads it.
const adminTools = require('app/_server-api/adminTools')
const remoteImage = require('app/_server-api/fetchRemoteImage')
const imgFromUrl = require('pages/api/img-from-url').default
const login = require('pages/api/admin/login').default
const updateSettings = require('pages/api/admin/update-settings').default
const showcasePublish = require('pages/api/admin/showcase-publish').default

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

  // Known bug: a rejected request is reported as a success.
  it.failing('reports failure without a valid token', async () => {
    const { body } = await callRoute(updateSettings, {
      method: 'POST',
      ...authorized('bad-token'),
      body: JSON.stringify({ message: 'hacked' })
    })

    expect(body.success).toBe(false)
  })
})

describe('/api/admin/showcase-publish', () => {
  it('publishes for an admin', async () => {
    fetchMock.mockResolvedValue({ json: async () => ({ success: true }) })

    const { body } = await callRoute(showcasePublish, {
      method: 'POST',
      ...authorized(),
      query: { shortlink: 'abc' }
    })

    expect(body).toEqual({ success: true, shortlink: 'abc' })
    expect(fetchMock).toHaveBeenCalledWith(
      'http://shortlinks.test/api/v1/shortlink/showcase/abc'
    )
  })

  it('does not publish without a valid token', async () => {
    await callRoute(showcasePublish, {
      method: 'POST',
      ...authorized('bad-token'),
      query: { shortlink: 'abc' }
    })

    expect(fetchMock).not.toHaveBeenCalled()
  })

  // Known bug: the route never responds, so the request hangs.
  it.failing('responds when the token is invalid', async () => {
    const { responded } = await callRoute(showcasePublish, {
      method: 'POST',
      ...authorized('bad-token'),
      query: { shortlink: 'abc' }
    })

    expect(responded).toBe(true)
  })
})
