import { blobChunks } from './streams'
import { assertBackupFilesAvailable } from './errors'
import { RecordDecoder, sha, hashJSON } from './codec'
import type { DatabaseSchema } from './native'
import { PERSISTENT_KEYS } from './platform'
import { NATIVE_DATABASE_VERSION } from '../_db/version'
export interface Manifest {
  format: 'artbot-backup'
  version: 1
  complete: true
  id: string
  createdAt: string
  origin: string
  standalone: boolean
  appBuild: string
  schema: DatabaseSchema
  chunkBytes: number
  maxPartBytes: number
  records: number
  preferencesDigest: string
  credentialsIncluded: boolean
  tables: { name: string; count: number; digest: string }[]
  parts: { name: string; size: number; sha256: string; index: number }[]
}
export function checkCancelled(signal?: AbortSignal) {
  if (signal?.aborted)
    throw new DOMException('Backup operation paused', 'AbortError')
}
export async function* jsonLines(
  file: Blob,
  limit: number,
  signal?: AbortSignal
) {
  const decoder = new TextDecoder('utf-8', { fatal: true })
  let buffer = ''
  for await (const bytes of blobChunks(file, signal)) {
    buffer += decoder.decode(bytes, { stream: true })
    let index: number
    while ((index = buffer.indexOf('\n')) !== -1) {
      if (index > limit) throw new Error('Backup record metadata is too large')
      const line = buffer.slice(0, index)
      buffer = buffer.slice(index + 1)
      if (line) yield JSON.parse(line)
    }
    if (buffer.length > limit) throw new Error('Backup line is too large')
  }
  buffer += decoder.decode()
  if (buffer) throw new Error('Incomplete backup part')
}

export async function readBackupManifest(file: Blob, signal?: AbortSignal) {
  checkCancelled(signal)
  assertBackupFilesAvailable([file])
  if (file.size > 1024 * 1024)
    throw new Error('Select one complete backup manifest and all its parts')
  const m: Manifest = JSON.parse(await file.text())
  if (
    m.format !== 'artbot-backup' ||
    m.version !== 1 ||
    m.complete !== true ||
    typeof m.id !== 'string' ||
    !Array.isArray(m.parts) ||
    !Array.isArray(m.tables) ||
    !m.schema?.stores ||
    !Number.isInteger(m.records) ||
    m.records < 0 ||
    !Number.isInteger(m.chunkBytes) ||
    m.chunkBytes < 256 ||
    m.chunkBytes > 256 * 1024 ||
    m.maxPartBytes < 4096 ||
    m.maxPartBytes > 64 * 1024 * 1024
  )
    throw new Error('Unsupported or incomplete ArtBot backup')
  if (
    !Number.isInteger(m.schema.version) ||
    m.schema.version > NATIVE_DATABASE_VERSION ||
    m.schema.version < 1
  )
    throw new Error('This backup needs a newer version of ArtBot')
  const keyPath = (value: unknown, nullable = false) =>
    (nullable && value === null) ||
    typeof value === 'string' ||
    (Array.isArray(value) &&
      value.length > 0 &&
      value.every((k) => typeof k === 'string'))
  if (
    !Number.isSafeInteger(m.maxPartBytes) ||
    !Array.isArray(m.schema.stores) ||
    new Set(m.schema.stores.map((s) => s.name)).size !==
      m.schema.stores.length ||
    m.schema.stores.some(
      (s) =>
        typeof s.name !== 'string' ||
        !keyPath(s.keyPath, true) ||
        typeof s.autoIncrement !== 'boolean' ||
        !Number.isSafeInteger(s.count) ||
        s.count < 0 ||
        !Array.isArray(s.indexes) ||
        new Set(s.indexes.map((i) => i.name)).size !== s.indexes.length ||
        s.indexes.some(
          (i) =>
            typeof i.name !== 'string' ||
            !keyPath(i.keyPath) ||
            typeof i.unique !== 'boolean' ||
            typeof i.multiEntry !== 'boolean'
        )
    )
  )
    throw new Error('Invalid backup schema')
  if (
    m.tables.some(
      (t) =>
        typeof t.name !== 'string' ||
        !Number.isSafeInteger(t.count) ||
        t.count < 0 ||
        typeof t.digest !== 'string'
    ) ||
    m.parts.some(
      (p) =>
        typeof p.name !== 'string' ||
        !Number.isSafeInteger(p.size) ||
        p.size <= 0 ||
        !/^[a-f0-9]{64}$/.test(p.sha256)
    )
  )
    throw new Error('Invalid backup manifest')
  if (
    new Set(m.parts.map((p) => p.name)).size !== m.parts.length ||
    new Set(m.tables.map((t) => t.name)).size !== m.tables.length
  )
    throw new Error('Missing, duplicate or unexpected backup files')
  if (!/^[a-f0-9]{64}$/.test(m.preferencesDigest))
    throw new Error('Invalid preferences digest')
  checkCancelled(signal)
  return m
}

export async function inspectBundle(files: Blob[], signal?: AbortSignal) {
  assertBackupFilesAvailable(files)
  const named = new Map<string, Blob>()
  for (const file of files) {
    const name = (file as File).name
    if (!name || named.has(name))
      throw new Error('Backup files must have unique filenames')
    named.set(name, file)
  }
  const manifests = files.filter((f) =>
    (f as File).name.endsWith('.manifest.json')
  )
  if (manifests.length !== 1 || manifests[0].size > 1024 * 1024)
    throw new Error('Select one complete backup manifest and all its parts')
  const m = await readBackupManifest(manifests[0], signal)
  if (m.parts.length !== files.length - 1)
    throw new Error('Missing, duplicate or unexpected backup files')
  for (const [i, part] of m.parts.entries()) {
    checkCancelled(signal)
    const file = named.get(part.name)
    if (
      !file ||
      part.index !== i ||
      file.size !== part.size ||
      file.size > m.maxPartBytes ||
      (await sha(await file.arrayBuffer())) !== part.sha256
    )
      throw new Error(`Missing or damaged backup part ${i + 1}`)
  }
  return { manifest: m, files: named }
}
// Prepared backups may read one part on demand instead of retaining every File.
export interface BackupBundle {
  manifest: Manifest
  files: { get(name: string): Blob | undefined | Promise<Blob | undefined> }
}
export async function* bundleRecords(
  bundle: BackupBundle,
  signal?: AbortSignal
) {
  const decoder = new RecordDecoder(),
    counts = new Map<string, { count: number; digest: string }>()
  for (const table of bundle.manifest.tables)
    counts.set(table.name, { count: 0, digest: '' })
  let total = 0,
    preferenceRecords = 0
  for (const part of bundle.manifest.parts) {
    for await (const line of jsonLines(
      (await bundle.files.get(part.name))!,
      bundle.manifest.maxPartBytes,
      signal
    )) {
      checkCancelled(signal)
      const row = await decoder.accept(line)
      if (!row) continue
      if (row.table === '@preferences') {
        if (
          ++preferenceRecords !== 1 ||
          row.key !== 'library' ||
          row.fingerprint !== bundle.manifest.preferencesDigest ||
          !row.value?.appConfig ||
          typeof row.value.appConfig !== 'object' ||
          Array.isArray(row.value.appConfig) ||
          !row.value.localPreferences ||
          typeof row.value.localPreferences !== 'object' ||
          Array.isArray(row.value.localPreferences) ||
          Object.entries(row.value.localPreferences).some(
            ([key, value]) =>
              !(PERSISTENT_KEYS as readonly string[]).includes(key) ||
              typeof value !== 'string'
          )
        )
          throw new Error('Invalid saved preferences')
        yield row
        continue
      }
      indexedDB.cmp(row.key, row.key)
      const state = counts.get(row.table)
      if (!state) throw new Error('Unexpected table in backup')
      state.count++
      state.digest = await hashJSON([state.digest, row.fingerprint])
      total++
      yield row
    }
  }
  decoder.finish()
  if (preferenceRecords !== 1) throw new Error('Missing saved preferences')
  if (total !== bundle.manifest.records)
    throw new Error('Backup record count mismatch')
  for (const t of bundle.manifest.tables) {
    const actual = counts.get(t.name)!
    if (
      actual.count !== t.count ||
      actual.digest !== t.digest ||
      bundle.manifest.schema.stores.find((s) => s.name === t.name)?.count !==
        t.count
    )
      throw new Error(`Backup verification failed for ${t.name}`)
  }
  if (counts.size !== bundle.manifest.schema.stores.length)
    throw new Error('Backup schema/table count mismatch')
}
