/* global IDBValidKey */
export const request = <T>(r: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    r.onsuccess = () => resolve(r.result)
    r.onerror = () => reject(r.error)
  })
export interface StoreSchema {
  name: string
  keyPath: string | string[] | null
  autoIncrement: boolean
  indexes: {
    name: string
    keyPath: string | string[]
    unique: boolean
    multiEntry: boolean
  }[]
  count: number
}
export interface DatabaseSchema {
  version: number
  stores: StoreSchema[]
}
export async function openExisting(name: string): Promise<IDBDatabase> {
  const r = indexedDB.open(name)
  r.onupgradeneeded = () => r.transaction!.abort()
  return request(r)
}
export async function describe(db: IDBDatabase): Promise<DatabaseSchema> {
  const stores: StoreSchema[] = []
  for (const name of db.objectStoreNames) {
    const s = db.transaction(name).objectStore(name)
    stores.push({
      name,
      keyPath: s.keyPath,
      autoIncrement: s.autoIncrement,
      count: await request(s.count()),
      indexes: [...s.indexNames].map((n) => {
        const i = s.index(n)
        return {
          name: n,
          keyPath: i.keyPath,
          unique: i.unique,
          multiEntry: i.multiEntry
        }
      })
    })
  }
  return { version: db.version, stores }
}
export async function createDatabase(name: string, schema: DatabaseSchema) {
  const r = indexedDB.open(name, schema.version)
  r.onupgradeneeded = () => {
    for (const s of schema.stores) {
      const store = r.result.createObjectStore(s.name, {
        keyPath: s.keyPath,
        autoIncrement: s.autoIncrement
      })
      for (const i of s.indexes) store.createIndex(i.name, i.keyPath, i)
    }
  }
  return request(r)
}
export async function nextRecord(
  db: IDBDatabase,
  table: string,
  after?: IDBValidKey
) {
  const cursor = await request(
    db
      .transaction(table)
      .objectStore(table)
      .openCursor(
        after === undefined ? undefined : IDBKeyRange.lowerBound(after, true)
      )
  )
  return cursor ? { key: cursor.primaryKey, value: cursor.value } : undefined
}
export async function putRecord(
  db: IDBDatabase,
  table: string,
  value: unknown,
  key?: IDBValidKey
) {
  const tx = db.transaction(table, 'readwrite')
  const s = tx.objectStore(table)
  const complete = new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onabort = () => reject(tx.error || new Error('Write aborted'))
    tx.onerror = () => {}
  })
  const result = request(s.keyPath === null ? s.add(value, key) : s.add(value))
  const [id] = await Promise.all([result, complete])
  return id
}
export async function* records(
  db: IDBDatabase,
  table: string,
  after?: IDBValidKey
) {
  let key = after
  while (true) {
    const row = await nextRecord(db, table, key)
    if (!row) return
    key = row.key
    yield row
  }
}
