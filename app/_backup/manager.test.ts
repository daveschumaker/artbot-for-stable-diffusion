import 'fake-indexeddb/auto'
import { BackupManager } from './manager'
import { readPreferences } from './platform'

class MemoryStorage implements Storage {
  private data = new Map<string, string>()
  get length() {
    return this.data.size
  }
  clear() {
    this.data.clear()
  }
  key(i: number) {
    return [...this.data.keys()][i] ?? null
  }
  getItem(k: string) {
    return this.data.get(k) ?? null
  }
  setItem(k: string, v: string) {
    this.data.set(k, String(v))
  }
  removeItem(k: string) {
    this.data.delete(k)
  }
}
const request = <T>(r: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    r.onsuccess = () => resolve(r.result)
    r.onerror = () => reject(r.error)
  })
let source: IDBDatabase
let manager: BackupManager
let storage: Storage
beforeEach(async () => {
  storage = new MemoryStorage()
  const name = `backup-source-${crypto.randomUUID()}`
  const open = indexedDB.open(name, 60)
  open.onupgradeneeded = () => {
    open.result
      .createObjectStore('completed', { keyPath: 'id', autoIncrement: true })
      .createIndex('jobId', 'jobId')
    open.result.createObjectStore('settings', {
      keyPath: 'id',
      autoIncrement: true
    })
  }
  source = await request(open)
  await request(
    source
      .transaction('completed', 'readwrite')
      .objectStore('completed')
      .put({ id: 1, jobId: 'existing', prompt: 'keep me' })
  )
  manager = new BackupManager({
    storage,
    defaultDatabase: name,
    catalogName: `${name}-catalog`
  })
})
afterEach(async () => {
  source.close()
  await manager.close()
})

it('recovers legacy images without Horde IDs, retains the original library and reports duplicates', async () => {
  const result = await manager.restore([
    new Blob([
      JSON.stringify([
        {
          id: 1,
          jobId: 'old-image',
          model: 'legacy-model',
          base64String: 'image-bytes',
          favorited: true,
          unknownField: { keep: 'this' }
        },
        { jobId: 'existing', prompt: 'duplicate must not overwrite' }
      ])
    ])
  ])
  expect(result.recovered).toBe(1)
  expect(result.duplicates).toBe(1)
  const restored = await request(indexedDB.open(manager.activeDatabase))
  const rows = await request(
    restored.transaction('completed').objectStore('completed').getAll()
  )
  expect(rows).toEqual([
    { id: 1, jobId: 'existing', prompt: 'keep me' },
    {
      id: 2,
      jobId: 'old-image',
      model: 'legacy-model',
      base64String: 'image-bytes',
      favorited: true,
      unknownField: { keep: 'this' }
    }
  ])
  expect(
    await request(
      source.transaction('completed').objectStore('completed').count()
    )
  ).toBe(1)
  restored.close()
  await manager.rollback()
  expect(manager.activeDatabase).toBe(source.name)
})

it('resumes preparation and restores a checked multipart backup with binary data, raw legacy fields and preferences', async () => {
  storage.setItem(
    'appConfig',
    JSON.stringify({ apiKey: 'private-test-key', theme: 'dark' })
  )
  const cycle: any = { note: 'cycle' }
  cycle.self = cycle
  await request(
    source
      .transaction('completed', 'readwrite')
      .objectStore('completed')
      .put({
        id: 4,
        jobId: 'rich',
        model: 'old-model',
        favorited: true,
        source_image: 'source'.repeat(5000),
        source_mask: 'mask-data',
        payload: new Blob([new Uint8Array(12000).fill(137)], {
          type: 'application/test'
        }),
        typed: new Uint16Array([1, 65535]),
        when: new Date('2020-01-02T00:00:00Z'),
        missing: undefined,
        cycle
      })
  )
  const abort = new AbortController()
  await expect(
    manager.prepare({
      maxPartBytes: 4096,
      chunkBytes: 512,
      signal: abort.signal,
      onProgress: (p) => {
        if (p.records === 1) abort.abort()
      }
    })
  ).rejects.toMatchObject({ name: 'AbortError' })
  const [paused] = await manager.preparations()
  expect(paused.status).toBe('paused')
  const completed = await manager.prepare({ resumeId: paused.id })
  const files = await manager.files(completed.id)
  expect(files.length).toBeGreaterThan(3)
  expect(files.slice(1).every((f) => f.size <= 4096)).toBe(true)
  const checked = await manager.verify(files)
  expect(checked.records).toBe(2)
  expect(checked.preferences).toEqual({ theme: 'dark' })
  const restored = await manager.restore(files)
  expect(restored.verified).toBe(true)
  const db = await request(indexedDB.open(manager.activeDatabase))
  const row: any = await request(
    db.transaction('completed').objectStore('completed').get(4)
  )
  expect(row.model).toBe('old-model')
  expect(row.models).toBeUndefined()
  expect(row.source_image).toBe('source'.repeat(5000))
  expect(row.source_mask).toBe('mask-data')
  expect(row.when).toEqual(new Date('2020-01-02T00:00:00Z'))
  expect(row.typed.constructor.name).toBe('Uint16Array')
  expect(Array.from(row.typed)).toEqual([1, 65535])
  expect(Object.hasOwn(row, 'missing')).toBe(true)
  expect(row.cycle.self).toBe(row.cycle)
  expect(row.payload.type).toBe('application/test')
  expect([...new Uint8Array(await row.payload.arrayBuffer())]).toEqual(
    new Array(12000).fill(137)
  )
  // Omitted credentials leave this device's existing key in place.
  expect(readPreferences(storage)).toEqual({
    theme: 'dark',
    apiKey: 'private-test-key'
  })
  db.close()
})

it('allows only one backup/restore writer across windows', async () => {
  const other = new BackupManager({
    storage,
    defaultDatabase: source.name,
    catalogName: `${source.name}-catalog`
  })
  let competing: Promise<unknown> | undefined
  await manager.prepare({
    onProgress: (p) => {
      if (p.phase === 'preparing' && !competing) {
        competing = other.prepare()
        competing.catch(() => {})
      }
    }
  })
  await expect(competing).rejects.toThrow(/another window|in progress/i)
  await other.close()
})

it('rejects missing or corrupted saved parts before replacing the library', async () => {
  const backup = await manager.prepare({ maxPartBytes: 4096, chunkBytes: 512 })
  const files = await manager.files(backup.id)
  await expect(manager.restore(files.slice(0, -1))).rejects.toThrow(
    /missing|unexpected/i
  )
  const changed = [...files]
  changed[1] = new File(['broken'], files[1].name)
  await expect(manager.restore(changed)).rejects.toThrow(/damaged|missing/i)
  expect(manager.activeDatabase).toBe(source.name)
  expect(
    await request(
      source.transaction('completed').objectStore('completed').count()
    )
  ).toBe(1)
})

it('resumes a cancelled restore after reopening the manager and retains the old selection until verification', async () => {
  await request(
    source
      .transaction('completed', 'readwrite')
      .objectStore('completed')
      .put({ id: 2, jobId: 'second' })
  )
  const prepared = await manager.prepare(),
    files = await manager.files(prepared.id)
  const abort = new AbortController()
  await expect(
    manager.restore(files, {
      signal: abort.signal,
      onProgress: (p) => {
        if (p.records === 1) abort.abort()
      }
    })
  ).rejects.toMatchObject({ name: 'AbortError' })
  expect(manager.activeDatabase).toBe(source.name)
  const [attempt] = await manager.restoreAttempts()
  expect(attempt.status).toBe('paused')
  await manager.close()
  manager = new BackupManager({
    storage,
    defaultDatabase: source.name,
    catalogName: `${source.name}-catalog`
  })
  await manager.restore(files, { resumeId: attempt.id })
  expect(manager.activeDatabase).toBe(attempt.name)
  expect(
    await request(
      source.transaction('completed').objectStore('completed').count()
    )
  ).toBe(2)
})

it('does not advance a backup checkpoint when storage rejects the next record', async () => {
  await request(
    source
      .transaction('completed', 'readwrite')
      .objectStore('completed')
      .put({ id: 2, jobId: 'second' })
  )
  const original = IDBObjectStore.prototype.add
  try {
    await expect(
      manager.prepare({
        onProgress: (p) => {
          if (p.phase === 'preparing' && p.records === 1)
            IDBObjectStore.prototype.add = function () {
              IDBObjectStore.prototype.add = original
              throw new DOMException(
                'Simulated disk full',
                'QuotaExceededError'
              )
            }
        }
      })
    ).rejects.toMatchObject({ name: 'QuotaExceededError' })
  } finally {
    IDBObjectStore.prototype.add = original
  }
  const [paused] = await manager.preparations()
  expect(paused.records).toBe(1)
  const completed = await manager.prepare({ resumeId: paused.id })
  expect(
    (await manager.verify(await manager.files(completed.id))).records
  ).toBe(2)
})

it('preserves empty binary payloads, Unicode, sparse arrays and shared typed buffers', async () => {
  const buffer = new ArrayBuffer(16)
  new Uint8Array(buffer).set([4, 8, 15, 16, 23, 42])
  const sparse: any[] = []
  sparse.length = 4
  sparse[2] = 'present'
  const text = '🐕\ud800\ufffd'.repeat(500)
  await request(
    source
      .transaction('completed', 'readwrite')
      .objectStore('completed')
      .put({
        id: 3,
        empty: new Blob([]),
        blob: new Blob(['x']),
        text,
        buffer,
        a: new Uint8Array(buffer),
        b: new DataView(buffer, 2, 5),
        sparse,
        map: new Map([['first', new Set([1, 2])]])
      })
  )
  const prepared = await manager.prepare({
    maxPartBytes: 4096,
    chunkBytes: 512
  })
  await manager.restore(await manager.files(prepared.id))
  const db = await request(indexedDB.open(manager.activeDatabase))
  const row: any = await request(
    db.transaction('completed').objectStore('completed').get(3)
  )
  expect(row.empty.size).toBe(0)
  expect(await row.blob.text()).toBe('x')
  expect(row.text).toBe(text)
  expect(row.a.buffer).toBe(row.buffer)
  expect(row.b.buffer).toBe(row.buffer)
  expect(row.b.byteLength).toBe(5)
  expect(row.sparse.length).toBe(4)
  expect(0 in row.sparse).toBe(false)
  expect(row.sparse[2]).toBe('present')
  expect([...row.map.get('first')]).toEqual([1, 2])
  db.close()
})

it('refuses a changed source when resuming instead of producing a mixed snapshot', async () => {
  const abort = new AbortController()
  await expect(
    manager.prepare({ signal: abort.signal, onProgress: () => abort.abort() })
  ).rejects.toMatchObject({ name: 'AbortError' })
  await request(
    source
      .transaction('completed', 'readwrite')
      .objectStore('completed')
      .put({ id: 1, jobId: 'existing', prompt: 'changed' })
  )
  const [job] = await manager.preparations()
  await expect(manager.prepare({ resumeId: job.id })).rejects.toThrow(/changed/)
  expect((await manager.preparations())[0].status).toBe('failed')
  expect(manager.activeDatabase).toBe(source.name)
})

it('keeps a verified candidate resumable if selection storage is full', async () => {
  const prepared = await manager.prepare(),
    files = await manager.files(prepared.id)
  const original = storage.setItem.bind(storage)
  storage.setItem = (key, value) => {
    if (key === 'ArtBotLibrarySelection')
      throw new DOMException('Full', 'QuotaExceededError')
    original(key, value)
  }
  await expect(manager.restore(files)).rejects.toMatchObject({
    name: 'QuotaExceededError'
  })
  expect(manager.activeDatabase).toBe(source.name)
  const [attempt] = await manager.restoreAttempts()
  expect(attempt.status).toBe('verified')
  storage.setItem = original
  await manager.restore(files, { resumeId: attempt.id })
  expect(manager.activeDatabase).toBe(attempt.name)
  await manager.rollback()
  expect(manager.activeDatabase).toBe(source.name)
})

it('requires explicit consent to restore credentials and never exports runtime keys', async () => {
  storage.setItem(
    'appConfig',
    JSON.stringify({ apiKey: 'backup-key', theme: 'dark' })
  )
  storage.setItem('ArtBotLastActive', 'runtime-only')
  const prepared = await manager.prepare({ includeCredentials: true }),
    files = await manager.files(prepared.id)
  const manifest = await manager.verify(files)
  expect(manifest.preferences).toEqual({ apiKey: 'backup-key', theme: 'dark' })
  storage.setItem('appConfig', JSON.stringify({ apiKey: 'device-key' }))
  await manager.restore(files)
  expect(readPreferences(storage).apiKey).toBe('device-key')
  await manager.rollback()
  await manager.restore(files, { restoreCredentials: true })
  expect(readPreferences(storage).apiKey).toBe('backup-key')
  expect(storage.getItem('ArtBotLastActive')).toBe('runtime-only')
})

it('refuses unsupported versions and false completeness without altering the active library', async () => {
  const prepared = await manager.prepare(),
    files = await manager.files(prepared.id)
  for (const mutation of [
    { version: 999 },
    { complete: false },
    { records: 2 }
  ]) {
    const manifest = { ...JSON.parse(await files[0].text()), ...mutation }
    await expect(
      manager.restore([
        new File([JSON.stringify(manifest)], files[0].name),
        ...files.slice(1)
      ])
    ).rejects.toThrow()
    expect(manager.activeDatabase).toBe(source.name)
  }
})

it('packs large persistent preferences into bounded parts and restores or rolls them back with the library', async () => {
  const { preferenceStorage } = await import('./platform')
  const sourceText = 'source-data-🐕'.repeat(100000)
  storage.setItem('controlnetPageInput', sourceText)
  storage.setItem(
    'favoriteLoras',
    JSON.stringify([{ id: 12, name: 'favorite' }])
  )
  storage.setItem('showLayout', 'grid')
  storage.setItem('ArtBotLastActive', 'do-not-restore')
  storage.setItem(
    'appConfig',
    JSON.stringify({ modelAutokeywords: true, apiKey: 'excluded' })
  )
  const prepared = await manager.prepare({ maxPartBytes: 1024 * 1024 })
  const files = await manager.files(prepared.id)
  expect(files[0].size).toBeLessThan(20000)
  expect(files.slice(1).every((f) => f.size <= 1024 * 1024)).toBe(true)
  const checked = await manager.verify(files)
  expect(checked.preferences).toEqual({ modelAutokeywords: true })
  expect(checked.localPreferences.controlnetPageInput).toBe(sourceText)
  expect(checked.localPreferences.ArtBotLastActive).toBeUndefined()
  storage.setItem('showLayout', 'layout')
  await manager.restore(files)
  const preferences = preferenceStorage(storage)
  expect(preferences.getItem('showLayout')).toBe('grid')
  expect(preferences.getItem('controlnetPageInput')).toBe(sourceText)
  preferences.setItem('showLayout', 'grid-new')
  expect(preferences.getItem('showLayout')).toBe('grid-new')
  expect(storage.getItem('showLayout')).toBe('grid-new')
  await manager.rollback()
  expect(preferences.getItem('showLayout')).toBe('layout')
})

it('keeps binary source reads bounded without issuing one disk read per serialization chunk', async () => {
  await request(
    source
      .transaction('completed', 'readwrite')
      .objectStore('completed')
      .put({ id: 2, payload: new Blob([new Uint8Array(3 * 1048576).fill(79)]) })
  )
  const row: any = await request(
    source.transaction('completed').objectStore('completed').get(2)
  )
  const prototype = Object.getPrototypeOf(row.payload),
    original = prototype.arrayBuffer
  const reads: number[] = []
  prototype.arrayBuffer = function () {
    reads.push(this.size)
    return original.call(this)
  }
  try {
    const job = await manager.prepare({ maxPartBytes: 1048576 })
    expect(job.status).toBe('complete')
    expect(reads.length).toBeGreaterThan(0)
    expect(reads.length).toBeLessThanOrEqual(15)
    expect(Math.max(...reads)).toBeLessThanOrEqual(1048576)
  } finally {
    prototype.arrayBuffer = original
  }
})

it('retains a previously active library after rollback instead of treating it as a disposable failed attempt', async () => {
  const prepared = await manager.prepare(),
    files = await manager.files(prepared.id)
  const restored = await manager.restore(files)
  await manager.rollback()
  expect((await manager.restoreAttempts())[0].status).toBe('retained')
  await expect(manager.discardAttempt(restored.id)).rejects.toThrow(/retained/)
  const retained = await request(indexedDB.open(restored.database))
  expect(
    await request(
      retained.transaction('completed').objectStore('completed').count()
    )
  ).toBe(1)
  retained.close()
})

it('can verify saved files even when the browser cannot store a verification timestamp', async () => {
  const prepared = await manager.prepare(),
    files = await manager.files(prepared.id)
  const original = storage.setItem.bind(storage)
  storage.setItem = (key, value) => {
    if (key.endsWith(':lastVerified'))
      throw new DOMException('Full', 'QuotaExceededError')
    original(key, value)
  }
  const checked = await manager.verify(files)
  expect(checked.records).toBe(1)
  expect(checked.verificationRecorded).toBe(false)
  expect(manager.activeDatabase).toBe(source.name)
})

it('keeps distinct images sharing a generation job ID during legacy array recovery', async () => {
  await request(
    source.transaction('completed', 'readwrite').objectStore('completed').put({
      id: 1,
      jobId: 'batch',
      hordeImageId: 'first',
      base64String: 'first-image'
    })
  )
  const result = await manager.restore([
    new Blob([
      JSON.stringify([
        {
          jobId: 'batch',
          hordeImageId: 'second',
          base64String: 'second-image'
        },
        {
          jobId: 'batch',
          hordeImageId: 'second',
          base64String: 'second-image'
        },
        { jobId: 'batch', hordeImageId: 'first', base64String: 'first-image' }
      ])
    ])
  ])
  expect(result).toMatchObject({ recovered: 1, duplicates: 2 })
  const target = await request(indexedDB.open(result.database))
  expect(
    await request(
      target.transaction('completed').objectStore('completed').count()
    )
  ).toBe(2)
  target.close()
})

it.each(['PromptInputSettings', 'appConfig'])(
  'activates and rolls back large %s without doubling localStorage usage',
  async (preferenceKey) => {
    const savedInput = JSON.stringify({
      source_image: 'x'.repeat(3 * 1024 * 1024)
    })
    const original = storage.setItem.bind(storage)
    storage.setItem = (key, value) => {
      const entries = Array.from(
        { length: storage.length },
        (_, i) => storage.key(i)!
      )
      const size = entries.reduce(
        (n, k) => n + (k === key ? 0 : storage.getItem(k)!.length),
        value.length
      )
      if (size > 5 * 1024 * 1024)
        throw new DOMException('Storage full', 'QuotaExceededError')
      original(key, value)
    }
    storage.setItem(preferenceKey, savedInput)
    storage.setItem('showLayout', 'grid')
    const prepared = await manager.prepare()
    const files = await manager.files(prepared.id)
    storage.setItem('showLayout', 'layout')
    await manager.restore(files)
    expect(storage.getItem('ArtBotLibrarySelection')!.length).toBeLessThan(2000)
    const { preferenceStorage } = await import('./platform')
    expect(storage.getItem(preferenceKey)).toBe(savedInput)
    expect(preferenceStorage(storage).getItem('showLayout')).toBe('grid')
    await manager.rollback()
    expect(storage.getItem(preferenceKey)).toBe(savedInput)
    expect(preferenceStorage(storage).getItem('showLayout')).toBe('layout')
  }
)

it('repairs the original preferences if activation and its immediate rollback are interrupted', async () => {
  const { recoverPreferenceTransition } = await import('./preferenceTransition')
  storage.setItem('showLayout', 'grid')
  const prepared = await manager.prepare()
  const files = await manager.files(prepared.id)
  storage.setItem('showLayout', 'layout')
  const original = storage.setItem.bind(storage)
  storage.setItem = (key, value) => {
    if (key === 'showLayout')
      throw new DOMException('Disk unavailable', 'QuotaExceededError')
    original(key, value)
  }
  await expect(manager.restore(files)).rejects.toThrow()
  expect(manager.activeDatabase).toBe(source.name)
  expect(storage.getItem('ArtBotLibrarySelection:transition')).not.toBeNull()
  storage.setItem = original
  await recoverPreferenceTransition(storage, 'ArtBotLibrarySelection')
  expect(storage.getItem('showLayout')).toBe('layout')
  expect(storage.getItem('ArtBotLibrarySelection:transition')).toBeNull()
})

it('finishes the committed preference transition after restarting before journal cleanup', async () => {
  const { recoverPreferenceTransition } = await import('./preferenceTransition')
  storage.setItem('showLayout', 'grid')
  const prepared = await manager.prepare()
  const files = await manager.files(prepared.id)
  storage.setItem('showLayout', 'layout')
  const original = storage.removeItem.bind(storage)
  storage.removeItem = (key) => {
    if (key.endsWith(':transition')) throw new Error('Interrupted cleanup')
    original(key)
  }
  await manager.restore(files)
  const chosen = manager.activeDatabase
  expect(storage.getItem('ArtBotLibrarySelection:transition')).not.toBeNull()
  // Simulate a process interrupted partway through applying individual keys.
  original('showLayout')
  storage.removeItem = original
  await recoverPreferenceTransition(storage, 'ArtBotLibrarySelection')
  expect(manager.activeDatabase).toBe(chosen)
  expect(storage.getItem('showLayout')).toBe('grid')
  expect(storage.getItem('ArtBotLibrarySelection:transition')).toBeNull()
})

it('serializes preference recovery across two windows', async () => {
  storage.setItem('showLayout', 'grid')
  const prepared = await manager.prepare()
  const files = await manager.files(prepared.id)
  const remove = storage.removeItem.bind(storage)
  storage.removeItem = (key) => {
    if (key.endsWith(':transition')) throw new Error('Interrupted')
    remove(key)
  }
  await manager.restore(files)
  storage.removeItem = remove
  const other = new BackupManager({
    storage,
    defaultDatabase: source.name,
    catalogName: manager.catalog.name
  })
  try {
    await Promise.all([
      manager.recoverPreferences(),
      other.recoverPreferences()
    ])
    expect(storage.getItem('showLayout')).toBe('grid')
    expect(storage.getItem('ArtBotLibrarySelection:transition')).toBeNull()
    expect(await manager.catalog.table('preferences').count()).toBe(0)
  } finally {
    await other.close()
  }
})

it('prunes temporary preference snapshots when a full localStorage cannot accept the journal', async () => {
  const prepared = await manager.prepare()
  const files = await manager.files(prepared.id)
  const write = storage.setItem.bind(storage)
  storage.setItem = (key, value) => {
    if (key.endsWith(':transition'))
      throw new DOMException('Storage full', 'QuotaExceededError')
    write(key, value)
  }
  await expect(manager.restore(files)).rejects.toMatchObject({
    name: 'QuotaExceededError'
  })
  expect(manager.activeDatabase).toBe(source.name)
  expect(await manager.catalog.table('preferences').count()).toBe(0)
})

it('honors pause after preference snapshots are durable but before publishing a selection', async () => {
  storage.setItem('showLayout', 'grid')
  const prepared = await manager.prepare()
  const files = await manager.files(prepared.id)
  storage.setItem('showLayout', 'layout')
  const abort = new AbortController()
  const table = manager.catalog.table('preferences')
  const persist = table.bulkAdd.bind(table)
  const writer = jest
    .spyOn(table, 'bulkAdd')
    .mockImplementation((items, keys, options) =>
      persist(items, keys, options).then((result) => {
        abort.abort()
        return result
      })
    )
  try {
    await expect(
      manager.restore(files, { signal: abort.signal })
    ).rejects.toMatchObject({ name: 'AbortError' })
    expect(manager.activeDatabase).toBe(source.name)
    expect(storage.getItem('showLayout')).toBe('layout')
    expect(await table.count()).toBe(0)
  } finally {
    writer.mockRestore()
  }
})
