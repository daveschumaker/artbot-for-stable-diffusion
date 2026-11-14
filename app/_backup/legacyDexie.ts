import { blobChunks } from './streams'
import { legacyImportStream } from './legacyStream'
import Dexie from 'dexie'
import { DATABASE_VERSION } from '../_db/version'
import { fingerprintRecord } from './codec'
import { openExisting, records } from './native'
import { checkCancelled } from './format'
export async function assertCompleteJSON(file: Blob, signal?: AbortSignal) {
  const decoder = new TextDecoder('utf-8', { fatal: true })
  const stack: string[] = []
  let string = false,
    escaped = false,
    started = false,
    closed = false
  for await (const bytes of blobChunks(file, signal)) {
    for (const c of decoder.decode(bytes, { stream: true })) {
      if (string) {
        if (escaped) escaped = false
        else if (c === '\\') escaped = true
        else if (c === '"') string = false
        continue
      }
      if (/\s/.test(c)) continue
      if (closed || (!started && c !== '{'))
        throw new Error('Expected a complete Dexie database export')
      started = true
      if (c === '"') string = true
      else if (c === '{' || c === '[') stack.push(c)
      else if (c === '}' || c === ']') {
        if (stack.pop() !== (c === '}' ? '{' : '['))
          throw new Error('Malformed database export')
        if (!stack.length) closed = true
      }
    }
  }
  decoder.decode()
  if (!closed || string) throw new Error('Incomplete database export')
}
function pathValue(object: any, path: string): any {
  return path.split('.').reduce((value, key) => value?.[key], object)
}
export async function importLegacyDexie(
  file: Blob,
  name: string,
  signal?: AbortSignal,
  onProgress?: (records: number, total: number) => void
) {
  await assertCompleteJSON(file, signal)
  checkCancelled(signal)
  const { importInto, peakImportFile } = await import('dexie-export-import')
  const meta = await peakImportFile(file)
  if (
    meta.formatVersion !== 1 ||
    meta.data.databaseVersion > DATABASE_VERSION ||
    meta.data.databaseVersion < 1 ||
    new Set(meta.data.tables.map((t) => t.name)).size !==
      meta.data.tables.length
  )
    throw new Error('Unsupported database export version or schema')
  const total = meta.data.tables.reduce((n, t) => n + t.rowCount, 0)
  if (!Number.isSafeInteger(total) || total < 0)
    throw new Error('Invalid table counts')
  const expected = new Map<string, Map<string, string>>(),
    tasks: Promise<void>[] = []
  let failed: unknown,
    count = 0
  for (const t of meta.data.tables) expected.set(t.name, new Map())
  const drain = async () => {
    await Promise.all(tasks.splice(0))
    if (failed) throw failed
  }
  const stream = legacyImportStream(file, drain, signal)
  const imported = new Dexie(name)
  imported
    .version(meta.data.databaseVersion)
    .stores(
      Object.fromEntries(
        meta.data.tables.map((table) => [table.name, table.schema])
      )
    )
  try {
    await importInto(imported, stream, {
      acceptNameDiff: true,
      noTransaction: true,
      chunkSizeBytes: 256 * 1024,
      filter: (table, value, key) => {
        checkCancelled(signal)
        const definition = meta.data.tables.find((t) => t.name === table)
        if (!definition) throw new Error('Unexpected table')
        const primary = definition.schema
          .split(',')[0]
          .replace(/^\+\+/, '')
          .replace(/^&/, '')
        const actualKey =
          key ??
          (primary.startsWith('[')
            ? primary
                .slice(1, -1)
                .split('+')
                .map((k) => pathValue(value, k))
            : pathValue(value, primary))
        indexedDB.cmp(actualKey, actualKey)
        const task = (async () => {
          const keyHash = await fingerprintRecord('key', actualKey, undefined)
          const fingerprint = await fingerprintRecord(
            table,
            actualKey,
            value,
            undefined,
            signal
          )
          const map = expected.get(table)!
          if (map.has(keyHash))
            throw new Error('Duplicate primary key in database export')
          map.set(keyHash, fingerprint)
        })().catch((e) => {
          failed = e
        })
        tasks.push(task)
        count++
        onProgress?.(count, total)
        return true
      }
    })
    // With noTransaction, an entirely empty archive performs no table writes.
    // Dexie stays lazy unless opened explicitly; its schema must still exist.
    await imported.open()
    await drain()
  } finally {
    await Promise.all(tasks.splice(0))
    imported.close()
  }
  const db = await openExisting(name)
  try {
    if (db.objectStoreNames.length !== meta.data.tables.length)
      throw new Error('Restored schema mismatch')
    for (const t of meta.data.tables) {
      let actualCount = 0
      for await (const row of records(db, t.name)) {
        checkCancelled(signal)
        const keyHash = await fingerprintRecord('key', row.key, undefined)
        if (
          expected.get(t.name)?.get(keyHash) !==
          (await fingerprintRecord(
            t.name,
            row.key,
            row.value,
            undefined,
            signal
          ))
        )
          throw new Error(`Restored data verification failed for ${t.name}`)
        actualCount++
      }
      if (
        actualCount !== t.rowCount ||
        expected.get(t.name)!.size !== t.rowCount
      )
        throw new Error(`Backup record count mismatch for ${t.name}`)
    }
    return { records: count, version: db.version }
  } finally {
    db.close()
  }
}
export async function compatibilityExport(
  name: string,
  onProgress?: (progress: any) => void
) {
  const { exportDB } = await import('dexie-export-import')
  // A separate dynamic Dexie has no application reading hooks or migrations.
  const raw = new Dexie(name)
  try {
    await raw.open()
    const exported = await exportDB(raw, {
      numRowsPerChunk: 1,
      prettyJson: false,
      progressCallback: (p) => {
        onProgress?.(p)
        return false
      }
    })
    // Older clients import by this header and always open imageHorde. Rewrite
    // only the small metadata prefix; image payloads remain Blob slices.
    const prefix = await exported.slice(0, 4096).text()
    const marker = '"databaseName":' + JSON.stringify(name)
    const start = prefix.indexOf(marker)
    if (start < 0)
      throw new Error('Unable to create a legacy-compatible header')
    const end = new TextEncoder().encode(
      prefix.slice(0, start + marker.length)
    ).length
    return new Blob(
      [
        prefix.slice(0, start) + '"databaseName":"imageHorde"',
        exported.slice(end)
      ],
      { type: 'application/json' }
    )
  } finally {
    raw.close()
  }
}
