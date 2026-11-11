/**
 * The feedback form shows whether a message was sent, so this route must
 * report the feedback service's failures instead of always answering ok.
 */
import type { NextApiRequest, NextApiResponse } from 'next'
import handler from './telemetry'

// Keep a local .env out of the test.
jest.mock('dotenv', () => ({ config: jest.fn() }))

const FEEDBACK_SERVICE = 'http://localhost:4001/api/v1/artbot/feedback'

const call = async (body: Record<string, unknown>) => {
  const req = {
    method: 'POST',
    body,
    headers: { 'user-agent': 'test-agent' }
  } as unknown as NextApiRequest
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(payload: unknown) {
      this.body = payload
      return this
    },
    send(payload: unknown) {
      this.body = payload
      return this
    }
  }
  await handler(req, res as unknown as NextApiResponse)
  return res
}

const feedback = {
  event: 'FEEDBACK_FORM',
  data: { input: 'Love it', contact: '' }
}

describe('POST /api/telemetry feedback', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('forwards the message with the user agent and answers ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 })

    const res = await call(feedback)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe(FEEDBACK_SERVICE)
    expect(JSON.parse(init.body)).toEqual({
      ...feedback,
      useragent: 'test-agent'
    })
  })

  it('answers 502 when the feedback service returns an error', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 })

    const res = await call(feedback)

    expect(res.statusCode).toBe(502)
    expect(res.body).toEqual({ status: 'not ok' })
  })

  it('answers 502 when the feedback service is unreachable', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new TypeError('fetch failed: ECONNREFUSED'))

    const res = await call(feedback)

    expect(res.statusCode).toBe(502)
  })

  it('rejects anything but POST', async () => {
    global.fetch = jest.fn()
    const status = jest.fn().mockReturnThis()
    const res = { status, json: jest.fn() } as unknown as NextApiResponse

    await handler(
      { method: 'GET', headers: {} } as unknown as NextApiRequest,
      res
    )

    expect(status).toHaveBeenCalledWith(400)
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
