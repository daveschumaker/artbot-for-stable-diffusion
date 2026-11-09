import http from 'http'
import { AddressInfo } from 'net'
import {
  fetchRemoteImage,
  isPublicAddress,
  RemoteImageError
} from './fetchRemoteImage'

const MAX_BYTES = 1000
const allowEverything = () => true

const codeFrom = (promise: Promise<unknown>) =>
  promise.then(
    () => 'SUCCEEDED',
    (error) => (error as RemoteImageError).code
  )

describe('isPublicAddress', () => {
  it.each([
    '8.8.8.8',
    '1.1.1.1',
    '172.15.255.255',
    '172.32.0.1',
    '100.63.255.255',
    '2606:4700:4700::1111'
  ])('allows %s', (address) => {
    expect(isPublicAddress(address)).toBe(true)
  })

  it.each([
    '0.0.0.0',
    '10.0.0.5',
    '100.64.0.1',
    '127.0.0.1',
    '127.255.255.254',
    '169.254.169.254',
    '172.16.0.1',
    '172.31.255.255',
    '192.168.1.1',
    '198.18.0.1',
    '224.0.0.1',
    '255.255.255.255',
    '::',
    '::1',
    'fc00::1',
    'fd12:3456::1',
    'fe80::1',
    'ff02::1',
    '::ffff:127.0.0.1',
    '::ffff:169.254.169.254',
    '::ffff:10.0.0.1',
    '64:ff9b::7f00:1',
    '2002:7f00:1::',
    'not-an-ip'
  ])('blocks %s', (address) => {
    expect(isPublicAddress(address)).toBe(false)
  })
})

describe('fetchRemoteImage', () => {
  let server: http.Server
  let port: number
  let hits: string[]
  let handle: http.RequestListener

  const url = (path = '/image.png') => `http://127.0.0.1:${port}${path}`

  // Tests that need a successful connection allow the local test server.
  const fetchLocal = (target: string, maxBytes = MAX_BYTES) =>
    fetchRemoteImage(target, { maxBytes, isAllowedAddress: allowEverything })

  beforeAll((done) => {
    server = http.createServer((req, res) => {
      hits.push(req.url ?? '')
      handle(req, res)
    })
    server.listen(0, '127.0.0.1', () => {
      port = (server.address() as AddressInfo).port
      done()
    })
  })

  afterAll((done) => {
    server.close(done)
  })

  beforeEach(() => {
    hits = []
    handle = (_req, res) => {
      res.setHeader('content-type', 'image/png')
      res.end('image-bytes')
    }
  })

  describe('with the default address rules', () => {
    const blocked = (target: string) =>
      codeFrom(fetchRemoteImage(target, { maxBytes: MAX_BYTES }))

    it('refuses the local server and never connects to it', async () => {
      expect(await blocked(url())).toBe('BLOCKED_ADDRESS')
      expect(hits).toEqual([])
    })

    it('refuses a hostname that resolves to a private address', async () => {
      expect(await blocked(`http://localhost:${port}/`)).toBe('BLOCKED_ADDRESS')
      expect(hits).toEqual([])
    })

    it.each([
      ['hexadecimal', (p: number) => `http://0x7f.0.0.1:${p}/`],
      ['decimal', (p: number) => `http://2130706433:${p}/`],
      ['octal', (p: number) => `http://0177.0.0.1:${p}/`],
      ['short', (p: number) => `http://127.1:${p}/`],
      ['IPv6 mapped', (p: number) => `http://[::ffff:127.0.0.1]:${p}/`],
      ['IPv6 loopback', (p: number) => `http://[::1]:${p}/`]
    ])('refuses a %s form of loopback', async (_name, build) => {
      expect(await blocked(build(port))).toBe('BLOCKED_ADDRESS')
      expect(hits).toEqual([])
    })

    it('refuses the cloud metadata address', async () => {
      expect(await blocked('http://169.254.169.254/latest/meta-data/')).toBe(
        'BLOCKED_ADDRESS'
      )
    })

    it.each([
      'file:///etc/passwd',
      'ftp://example.com/a.png',
      'gopher://example.com/',
      'data:image/png;base64,AAAA',
      'http://user:pass@example.com/a.png',
      'not a url',
      '',
      undefined,
      null,
      42,
      { toString: () => 'http://127.0.0.1/' }
    ])('rejects the invalid URL %p', async (value) => {
      expect(
        await codeFrom(fetchRemoteImage(value, { maxBytes: MAX_BYTES }))
      ).toBe('INVALID_URL')
    })
  })

  it('returns the body and content type', async () => {
    const result = await fetchLocal(url())

    expect(result.body.toString()).toBe('image-bytes')
    expect(result.contentType).toBe('image/png')
  })

  it('follows a redirect', async () => {
    handle = (req, res) => {
      if (req.url === '/start') {
        res.writeHead(302, { location: '/end' })
        return res.end()
      }
      res.end('final')
    }

    expect((await fetchLocal(url('/start'))).body.toString()).toBe('final')
    expect(hits).toEqual(['/start', '/end'])
  })

  it('applies the address rules to redirect targets', async () => {
    handle = (_req, res) => {
      res.writeHead(302, { location: 'http://10.0.0.5/secret' })
      res.end()
    }

    const code = await codeFrom(
      fetchRemoteImage(url('/start'), {
        maxBytes: MAX_BYTES,
        isAllowedAddress: (address) => address === '127.0.0.1'
      })
    )

    expect(code).toBe('BLOCKED_ADDRESS')
    expect(hits).toEqual(['/start'])
  })

  it('refuses a redirect to another scheme', async () => {
    handle = (_req, res) => {
      res.writeHead(302, { location: 'file:///etc/passwd' })
      res.end()
    }

    expect(await codeFrom(fetchLocal(url()))).toBe('INVALID_URL')
  })

  it('stops after too many redirects', async () => {
    handle = (req, res) => {
      res.writeHead(302, { location: `${req.url}x` })
      res.end()
    }

    expect(await codeFrom(fetchLocal(url('/r')))).toBe('FETCH_FAILED')
    expect(hits).toHaveLength(4)
  })

  it('refuses a declared size over the limit', async () => {
    handle = (_req, res) => {
      res.setHeader('content-length', String(MAX_BYTES + 1))
      res.end('x'.repeat(MAX_BYTES + 1))
    }

    expect(await codeFrom(fetchLocal(url()))).toBe('TOO_LARGE')
  })

  it('stops a download that exceeds the limit with no declared size', async () => {
    handle = (_req, res) => {
      res.write('x'.repeat(MAX_BYTES))
      res.write('x'.repeat(MAX_BYTES))
      res.end()
    }

    expect(await codeFrom(fetchLocal(url()))).toBe('TOO_LARGE')
  })

  it.each([404, 500])('fails on HTTP %i', async (status) => {
    handle = (_req, res) => {
      res.statusCode = status
      res.end('nope')
    }

    expect(await codeFrom(fetchLocal(url()))).toBe('FETCH_FAILED')
  })

  it('fails when nothing is listening', async () => {
    expect(await codeFrom(fetchLocal('http://127.0.0.1:1/'))).toBe(
      'FETCH_FAILED'
    )
  })
})
