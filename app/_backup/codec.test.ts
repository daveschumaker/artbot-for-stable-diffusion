import { encodeRecord, fingerprintRecord } from './codec'

it('audits the same graph fingerprint without allocating serialized backup Blobs', async () => {
  const buffer = new Uint8Array([0, 17, 255]).buffer
  const value: any = {
    source: new Blob([new Uint8Array(3 * 1024 * 1024).fill(91)]),
    text: '犬 🐕 café'.repeat(2000),
    date: new Date('2020-01-02'),
    missing: undefined,
    buffer,
    view: new Uint8Array(buffer),
    sparse: new Array(4),
    map: new Map([['remember', new Set([1, 2])]])
  }
  value.self = value
  const NativeBlob = Blob
  let allocations = 0
  globalThis.Blob = new Proxy(NativeBlob, {
    construct(target, args) {
      allocations++
      return Reflect.construct(target, args)
    }
  })
  try {
    const encoded = await encodeRecord('completed', ['key', 1], value)
    expect(allocations).toBeGreaterThan(20)
    allocations = 0
    expect(await fingerprintRecord('completed', ['key', 1], value)).toBe(
      encoded.fingerprint
    )
    expect(allocations).toBe(0)
  } finally {
    globalThis.Blob = NativeBlob
  }
})

it('pauses fingerprinting inside a large Blob rather than reading the entire record', async () => {
  const source = new Blob([new Uint8Array(4 * 1024 * 1024)])
  const slice = source.slice.bind(source)
  const abort = new AbortController()
  let reads = 0
  source.slice = (...args) => {
    reads++
    const part = slice(...args)
    const read = part.arrayBuffer.bind(part)
    part.arrayBuffer = async () => {
      const bytes = await read()
      abort.abort()
      return bytes
    }
    return part
  }
  await expect(
    fingerprintRecord('completed', 1, { source }, undefined, abort.signal)
  ).rejects.toMatchObject({ name: 'AbortError' })
  expect(reads).toBe(1)
})
