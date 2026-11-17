/* global IDBValidKey */
import 'fake-indexeddb/auto'
import { BackupManager } from 'app/_backup/manager'
import { request } from 'app/_backup/native'
import { rebuildThumbnails, clearPendingItems } from './maintenance'
class MemoryStorage implements Storage {
  data = new Map<string, string>()
  get length() {
    return this.data.size
  }
  clear() {
    this.data.clear()
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null
  }
  getItem(key: string) {
    return this.data.get(key) ?? null
  }
  setItem(key: string, value: string) {
    this.data.set(key, value)
  }
  removeItem(key: string) {
    this.data.delete(key)
  }
}
let database: IDBDatabase
let manager: BackupManager
let storage: Storage
beforeEach(async () => {
  const open = indexedDB.open('maintenance-' + crypto.randomUUID(), 60)
  open.onupgradeneeded = () => {
    open.result.createObjectStore('completed', { keyPath: 'id' })
    open.result.createObjectStore('pending', { keyPath: 'id' })
  }
  database = await request(open)
  storage = new MemoryStorage()
  manager = new BackupManager({
    storage,
    defaultDatabase: database.name,
    catalogName: database.name + '-catalog'
  })
  await request(
    database
      .transaction('completed', 'readwrite')
      .objectStore('completed')
      .put({
        id: 1,
        jobId: 'dog',
        base64String: 'pixels',
        source_image: new Blob(['remember']),
        extra: { keep: true }
      })
  )
  await request(
    database
      .transaction('completed', 'readwrite')
      .objectStore('completed')
      .put({ id: 2, base64String: 'other', thumbnail: 'already-done' })
  )
  await request(
    database
      .transaction('pending', 'readwrite')
      .objectStore('pending')
      .put({ id: 1 })
  )
})
afterEach(async () => {
  database.close()
  await manager.close()
})
const row = () =>
  request<any>(
    database.transaction('completed').objectStore('completed').get(1)
  )
it('resumes from native thumbnails, skips unreadable rows and preserves uploaded sources and unknown fields', async () => {
  const convert = jest.fn(async () => 'thumbnail')
  expect(await rebuildThumbnails(manager, { convert })).toMatchObject({
    current: 2,
    created: 1,
    skipped: 0
  })
  const saved = await row()
  expect(saved).toMatchObject({
    extra: { keep: true },
    thumbnail: 'thumbnail',
    base64String: 'pixels'
  })
  expect(await saved.source_image.text()).toBe('remember')
  expect((await rebuildThumbnails(manager, { convert })).created).toBe(0)
  expect(convert).toHaveBeenCalledTimes(1)
})
it('does not write after pausing during conversion and releases the operation fence', async () => {
  const abort = new AbortController()
  await expect(
    rebuildThumbnails(manager, {
      signal: abort.signal,
      convert: async () => {
        abort.abort()
        return 'must-not-save'
      }
    })
  ).rejects.toMatchObject({ name: 'AbortError' })
  expect((await row()).thumbnail).toBeUndefined()
  expect((await manager.prepare()).status).toBe('complete')
})
it('excludes another backup while conversion is in flight', async () => {
  let finish!: (value: string) => void
  let started!: () => void
  const ready = new Promise<void>((resolve) => {
    started = resolve
  })
  const work = rebuildThumbnails(manager, {
    convert: async () => {
      started()
      return new Promise<string>((resolve) => {
        finish = resolve
      })
    }
  })
  await ready
  await expect(manager.prepare()).rejects.toThrow(/in progress/)
  finish('thumbnail')
  await work
})
it('does not overwrite a newer image while conversion yields', async () => {
  const result = await rebuildThumbnails(manager, {
    convert: async () => {
      await request(
        database
          .transaction('completed', 'readwrite')
          .objectStore('completed')
          .put({ id: 1, base64String: 'new pixels', newer: true })
      )
      return 'old thumbnail'
    }
  })
  expect(result.created).toBe(0)
  expect(await row()).toEqual({
    id: 1,
    base64String: 'new pixels',
    newer: true
  })
})
it('requires the confirmed pending count and never clears completed images', async () => {
  await expect(clearPendingItems(manager, 2)).rejects.toThrow(/queue changed/)
  expect(
    await request(
      database.transaction('pending').objectStore('pending').count()
    )
  ).toBe(1)
  expect(await clearPendingItems(manager, 1)).toBe(1)
  expect(
    await request(
      database.transaction('pending').objectStore('pending').count()
    )
  ).toBe(0)
  expect(
    await request(
      database.transaction('completed').objectStore('completed').count()
    )
  ).toBe(2)
})

it('preserves the image and releases its lease when a thumbnail write exhausts storage', async () => {
  const put = IDBObjectStore.prototype.put
  const spy = jest
    .spyOn(IDBObjectStore.prototype, 'put')
    .mockImplementation(function (
      this: IDBObjectStore,
      value: any,
      key?: IDBValidKey
    ) {
      if (this.name === 'completed' && value.thumbnail)
        throw new DOMException('Synthetic full disk', 'QuotaExceededError')
      return key === undefined
        ? put.call(this, value)
        : put.call(this, value, key)
    })
  try {
    await expect(
      rebuildThumbnails(manager, { convert: async () => 'thumbnail' })
    ).rejects.toMatchObject({ name: 'QuotaExceededError' })
  } finally {
    spy.mockRestore()
  }
  expect((await row()).thumbnail).toBeUndefined()
  expect((await manager.prepare()).status).toBe('complete')
})
