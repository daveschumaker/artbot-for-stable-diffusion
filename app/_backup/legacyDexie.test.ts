import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import * as codec from './codec'
import { importLegacyDexie } from './legacyDexie'

// FileReader is a browser API; use Node's native Blob bytes in this test seam.
// The parser, Typeson codec, importer, fingerprinting and database are real.
class BlobReader {
  onload?: (event: any) => void
  onerror?: (event: any) => void
  readAsArrayBuffer(blob: Blob) {
    blob.arrayBuffer().then(
      (result) => this.onload?.({ target: { result } }),
      (error) => this.onerror?.({ target: { error } })
    )
  }
}
beforeAll(() => {
  Object.defineProperty(globalThis, 'self', {
    value: globalThis,
    configurable: true
  })
  Object.defineProperty(globalThis, 'FileReader', {
    value: BlobReader,
    configurable: true
  })
})
afterAll(() => {
  Reflect.deleteProperty(globalThis, 'self')
  Reflect.deleteProperty(globalThis, 'FileReader')
})
it('finishes fingerprint work before reading further legacy import chunks', async () => {
  const count = 12
  const rows = Array.from({ length: count }, (_, id) => ({
    id: id + 1,
    base64String: 'x'.repeat(1024 * 1024)
  }))
  const file = new Blob([
    JSON.stringify({
      formatName: 'dexie',
      formatVersion: 1,
      data: {
        databaseName: 'imageHorde',
        databaseVersion: 6,
        tables: [{ name: 'completed', schema: '++id', rowCount: count }],
        data: [{ tableName: 'completed', inbound: true, rows }]
      }
    })
  ])
  let active = 0,
    peak = 0
  const actual = codec.fingerprintRecord
  const encoder = jest
    .spyOn(codec, 'fingerprintRecord')
    .mockImplementation(async (...args) => {
      const large = args[0] === 'completed' && !!(args[2] as any)?.base64String
      if (large) peak = Math.max(peak, ++active)
      try {
        return await actual(...args)
      } finally {
        if (large) active--
      }
    })
  const name = `legacy-bounded-${crypto.randomUUID()}`
  try {
    expect(await importLegacyDexie(file, name)).toMatchObject({
      records: count
    })
    expect(peak).toBe(1)
    const database = new Dexie(name)
    await database.open()
    expect(await database.table('completed').count()).toBe(count)
    database.close()
  } finally {
    encoder.mockRestore()
    await Dexie.delete(name)
  }
}, 30000)

it('preserves legacy Blob bytes and out-of-line keys and closes a cancelled import', async () => {
  const { exportDB } = await import('dexie-export-import')
  const sourceName = `legacy-rich-${crypto.randomUUID()}`
  const restoredName = `${sourceName}-restored`
  const interruptedName = `${sourceName}-interrupted`
  const source = new Dexie(sourceName)
  source.version(6).stores({ completed: '++id', extra: '' })
  const value = {
    id: 1,
    prompt: '犬 🐕 café',
    source_image: new Blob([new Uint8Array(1024 * 1024).fill(137)]),
    when: new Date('2020-01-02'),
    missing: undefined
  }
  try {
    await source.table('completed').add(value)
    await source.table('extra').add({ note: 'outbound' }, ['compound', 7])
    const file = await exportDB(source, { numRowsPerChunk: 1 })
    await importLegacyDexie(file, restoredName)
    const restored = new Dexie(restoredName)
    await restored.open()
    try {
      const actual = await restored.table('completed').get(1)
      expect(
        (await codec.encodeRecord('completed', 1, actual)).fingerprint
      ).toBe((await codec.encodeRecord('completed', 1, value)).fingerprint)
      expect(await restored.table('extra').get(['compound', 7])).toEqual({
        note: 'outbound'
      })
    } finally {
      restored.close()
    }
    const abort = new AbortController()
    await expect(
      importLegacyDexie(file, interruptedName, abort.signal, (count) => {
        if (count === 1) abort.abort()
      })
    ).rejects.toMatchObject({ name: 'AbortError' })
    // An importer-owned connection must not block removing a cancelled candidate.
    await Dexie.delete(interruptedName)
  } finally {
    source.close()
    await Promise.all(
      [sourceName, restoredName, interruptedName].map((name) =>
        Dexie.delete(name)
      )
    )
  }
}, 30000)
