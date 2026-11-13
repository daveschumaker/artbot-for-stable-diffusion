/* global IDBValidKey */
import Dexie from 'dexie'
import {
  transitionPreferences,
  recoverPreferenceTransition
} from './preferenceTransition'
import {
  selection,
  readPreferences,
  readLocalPreferences,
  Selection,
  SELECTION_KEY,
  backupWindowId,
  HANDOFF_EVENT
} from './platform'
import {
  createDatabase,
  describe,
  openExisting,
  putRecord,
  records,
  request
} from './native'
import { legacyRows } from './legacy'
import { encodeRecord, hashJSON, sha } from './codec'
import {
  bundleRecords,
  checkCancelled,
  inspectBundle,
  Manifest
} from './format'
import { compatibilityExport, importLegacyDexie } from './legacyDexie'
import { assertHeadroom, storageStatus, restoreSpaceRequired } from './storage'
import { assertBackupFilesAvailable } from './errors'

export interface BackupOptions {
  storage: Storage
  defaultDatabase?: string
  catalogName?: string
  selectionKey?: string
  getBuild?: () => string
}
export interface RestoreReport {
  id: string
  database: string
  recovered: number
  duplicates: number
  verified: boolean
}
export interface RestoreOptions {
  resumeId?: string
  restoreCredentials?: boolean
  signal?: AbortSignal
  onProgress?: (progress: Progress) => void
}
export interface Progress {
  phase: string
  records: number
  total: number
  bytes: number
}
export interface PrepareOptions {
  resumeId?: string
  maxPartBytes?: number
  chunkBytes?: number
  includeCredentials?: boolean
  signal?: AbortSignal
  onProgress?: (progress: Progress) => void
}
export interface BackupInventory {
  id: string
  createdAt: string
  records: number
  images: number
  includeCredentials: boolean
  files: {
    name: string
    size: number
    label: string
    requested: boolean
    verified: boolean
  }[]
  complete: boolean
}
export interface BackupHandoff {
  id: string
  complete: boolean
  records: number
  files: { name: string; requested: boolean; verified: boolean }[]
  verificationRecorded?: boolean
}
const credentialPreference = (key: string) =>
  /(?:api[_-]?key|shared[_-]?key|(?:access|refresh|user)[_-]?token|password|secret|credential|^key$|^token$)/i.test(
    key
  )
const safePreferences = (
  prefs: Record<string, unknown>,
  includeCredentials: boolean
) =>
  Object.fromEntries(
    Object.entries(prefs).filter(
      ([key]) => includeCredentials || !credentialPreference(key)
    )
  )
export class BackupManager {
  readonly storage: Storage
  readonly defaultDatabase: string
  readonly selectionKey: string
  readonly catalog: Dexie
  private leaseToken?: string
  private getBuild: () => string
  constructor(options: BackupOptions) {
    this.storage = options.storage
    this.defaultDatabase = options.defaultDatabase || 'imageHorde'
    this.selectionKey = options.selectionKey || SELECTION_KEY
    this.getBuild = options.getBuild || (() => 'unknown')
    this.catalog = new Dexie(options.catalogName || 'ArtBotBackupCatalog')
    this.catalog.version(1).stores({
      restores: 'id',
      jobs: 'id',
      records: '[job+ordinal], job',
      parts: '[job+index], job',
      locks: 'id'
    })
    this.catalog.version(2).stores({ preferences: 'id' })
  }
  private captureSelection(): Selection {
    return {
      ...(selection(this.storage, this.selectionKey) || {
        name: this.defaultDatabase,
        generation: 'original'
      }),
      appConfig: readPreferences(this.storage, this.selectionKey),
      localPreferences: readLocalPreferences(this.storage, this.selectionKey)
    }
  }
  private async selectLibrary(
    after: Selection,
    before: Selection,
    signal?: AbortSignal
  ) {
    await transitionPreferences(
      this.catalog,
      this.storage,
      this.selectionKey,
      after,
      async () => {
        await this.checkLease()
        this.assertSelection(before)
        checkCancelled(signal)
      }
    )
  }
  get activeDatabase() {
    return (
      selection(this.storage, this.selectionKey)?.name || this.defaultDatabase
    )
  }
  private async exclusive<T>(
    label: string,
    action: () => Promise<T>,
    options: { readOnlySource?: boolean } = {}
  ): Promise<T> {
    const token = crypto.randomUUID(),
      key = `${this.selectionKey}:operation`,
      locks = this.catalog.table('locks')
    await this.catalog.transaction('rw', locks, async () => {
      const existing = await locks.get('library')
      if (existing && existing.expires > Date.now())
        throw new Error('A backup or restore is in progress in another window')
      await locks.put({
        id: 'library',
        token,
        expires: Date.now() + 30000,
        label
      })
    })
    const mirror = () =>
      this.storage.setItem(
        key,
        JSON.stringify({
          token,
          owner: backupWindowId(),
          expires: Date.now() + 30000,
          label
        })
      )
    this.leaseToken = token
    const timer = setInterval(() => {
      this.catalog
        .transaction('rw', locks, async () => {
          const current = await locks.get('library')
          if (current?.token !== token) return
          current.expires = Date.now() + 30000
          await locks.put(current)
          if (!options.readOnlySource) mirror()
        })
        .catch(() => {
          /* The next fenced operation checks the durable lease. */
        })
    }, 5000)
    try {
      // Saved-file verification reads immutable preparation data. Its catalog
      // lease protects cleanup, without requiring space for a source-write hint.
      if (!options.readOnlySource) mirror()
      await recoverPreferenceTransition(this.storage, this.selectionKey)
      return await action()
    } finally {
      clearInterval(timer)
      this.leaseToken = undefined
      // Cleanup must not report a committed selection as a failed restore.
      // A failed release expires naturally and cannot authorize another writer.
      await this.catalog
        .transaction('rw', locks, async () => {
          if ((await locks.get('library'))?.token === token)
            await locks.delete('library')
        })
        .catch(() => {})
      try {
        if (JSON.parse(this.storage.getItem(key) || 'null')?.token === token)
          this.storage.removeItem(key)
      } catch {
        /* expiry remains the fallback */
      }
    }
  }
  private async checkLease() {
    const current = await this.catalog.table('locks').get('library')
    if (
      !this.leaseToken ||
      current?.token !== this.leaseToken ||
      current.expires < Date.now()
    )
      throw new DOMException(
        'The backup session expired; resume it in this window',
        'AbortError'
      )
  }
  private assertSelection(before: Selection) {
    const current = selection(this.storage, this.selectionKey)
    if (
      (current?.name || this.defaultDatabase) !== before.name ||
      (current?.generation || 'original') !== before.generation
    )
      throw new Error('The selected library changed. Reload before restoring.')
  }
  private async prepareSelection(before: Selection) {
    // A formerly active library is retained, never offered as an incomplete
    // candidate that can be discarded after rollback.
    if (before.restoreId)
      await this.catalog
        .table('restores')
        .update(before.restoreId, { status: 'retained' })
    await this.checkLease()
    this.assertSelection(before)
  }
  async recoverPreferences() {
    while (this.storage.getItem(`${this.selectionKey}:transition`)) {
      try {
        await this.exclusive('Recovering library preferences', async () => {})
      } catch (error) {
        const lock = await this.catalog.table('locks').get('library')
        if (!this.storage.getItem(`${this.selectionKey}:transition`)) return
        if (!lock || lock.expires <= Date.now()) throw error
        await new Promise((resolve) => setTimeout(resolve, 250))
      }
    }
  }
  async preparations() {
    return this.catalog.table('jobs').toArray()
  }
  async restoreAttempts() {
    return this.catalog.table('restores').toArray()
  }
  async prepare(options: PrepareOptions = {}): Promise<any> {
    return this.exclusive('Preparing a backup', () =>
      this.prepareSnapshot(options)
    )
  }
  private async prepareSnapshot(options: PrepareOptions): Promise<any> {
    const capacity = await storageStatus()
    await assertHeadroom(
      (capacity.usage || 0) * 1.5 +
        (options.maxPartBytes || 32 * 1024 * 1024) * 2
    )
    const source = await openExisting(this.activeDatabase)
    try {
      const schema = await describe(source)
      let job: any = options.resumeId
        ? await this.catalog.table('jobs').get(options.resumeId)
        : undefined
      if (
        options.resumeId &&
        (!job ||
          job.status === 'complete' ||
          job.source !== source.name ||
          JSON.stringify(job.schema) !== JSON.stringify(schema))
      ) {
        source.close()
        throw new Error(
          'The source library changed or this preparation is already complete. Start a new backup.'
        )
      }
      if (!job) {
        const maxPartBytes = options.maxPartBytes || 32 * 1024 * 1024,
          chunkBytes = options.chunkBytes || 128 * 1024
        if (
          maxPartBytes < 4096 ||
          maxPartBytes > 64 * 1024 * 1024 ||
          chunkBytes < 256 ||
          chunkBytes > 256 * 1024
        ) {
          source.close()
          throw new Error('Invalid backup size limits')
        }
        job = {
          id: crypto.randomUUID(),
          source: source.name,
          schema,
          tableIndex: 0,
          records: 0,
          bytes: 0,
          status: 'preparing',
          chunkBytes,
          maxPartBytes,
          includeCredentials: !!options.includeCredentials,
          preferences: safePreferences(
            readPreferences(this.storage, this.selectionKey),
            !!options.includeCredentials
          ),
          localPreferences: readLocalPreferences(
            this.storage,
            this.selectionKey
          ),
          createdAt: new Date().toISOString(),
          tables: schema.stores.map((s) => ({
            name: s.name,
            count: 0,
            digest: ''
          }))
        }
      }
      job.status = 'preparing'
      const progress = (phase: string) =>
        options.onProgress?.({
          phase,
          records: job.records,
          total: schema.stores.reduce((n, s) => n + s.count, 0),
          bytes: job.bytes
        })
      try {
        await this.catalog.table('jobs').put(job)
        this.publishHandoff(job)
        for (; job.tableIndex < schema.stores.length; job.tableIndex++) {
          const table = schema.stores[job.tableIndex]
          for await (const row of records(source, table.name, job.lastKey)) {
            checkCancelled(options.signal)
            await this.checkLease()
            const encoded = await encodeRecord(
              table.name,
              row.key,
              row.value,
              job.chunkBytes
            )
            if (encoded.lines.some((b) => b.size > job.maxPartBytes))
              throw new Error(
                'A record has too much metadata for this part size. Choose a larger part size.'
              )
            const ordinal = job.records
            job.records++
            job.bytes += encoded.bytes
            job.lastKey = row.key
            job.tables[job.tableIndex].count++
            job.tables[job.tableIndex].digest = await hashJSON([
              job.tables[job.tableIndex].digest,
              encoded.fingerprint
            ])
            await this.catalog.transaction(
              'rw',
              this.catalog.table('jobs'),
              this.catalog.table('records'),
              async () => {
                await this.catalog.table('records').add({
                  job: job.id,
                  ordinal,
                  lines: encoded.lines,
                  fingerprint: encoded.fingerprint,
                  table: table.name
                })
                await this.catalog.table('jobs').put(job)
              }
            )
            progress('preparing')
            checkCancelled(options.signal)
          }
          delete job.lastKey
        }
        if (JSON.stringify(await describe(source)) !== JSON.stringify(schema))
          throw new Error(
            'The library changed during preparation. Start a new backup.'
          )
        if (
          JSON.stringify(
            safePreferences(
              readPreferences(this.storage, this.selectionKey),
              job.includeCredentials
            )
          ) !== JSON.stringify(job.preferences)
        )
          throw new Error(
            'Saved preferences changed during preparation. Start a new backup.'
          )
        if (
          JSON.stringify(
            readLocalPreferences(this.storage, this.selectionKey)
          ) !== JSON.stringify(job.localPreferences)
        )
          throw new Error(
            'Saved preferences changed during preparation. Start a new backup.'
          )
        let ordinal = 0
        for (const table of schema.stores)
          for await (const row of records(source, table.name)) {
            checkCancelled(options.signal)
            await this.checkLease()
            const expected = await this.catalog
              .table('records')
              .get([job.id, ordinal++])
            if (
              !expected ||
              (
                await encodeRecord(
                  table.name,
                  row.key,
                  row.value,
                  job.chunkBytes
                )
              ).fingerprint !== expected.fingerprint
            )
              throw new Error(
                'The library changed during preparation. Start a new backup.'
              )
            options.onProgress?.({
              phase: 'checking source',
              records: ordinal,
              total: job.records,
              bytes: job.bytes
            })
          }
        const preferences = await encodeRecord(
          '@preferences',
          'library',
          {
            appConfig: job.preferences,
            localPreferences: job.localPreferences
          },
          job.chunkBytes
        )
        if (preferences.lines.some((line) => line.size > job.maxPartBytes))
          throw new Error(
            'Preferences have too much metadata. Start a new backup with a larger part size.'
          )
        await this.catalog
          .table('records')
          .put({ job: job.id, ordinal: job.records, lines: preferences.lines })
        let slices: { ordinal: number; line: number }[] = [],
          blobs: Blob[] = [],
          bytes = 0,
          index = 0
        const parts: Manifest['parts'] = []
        const flush = async () => {
          if (!blobs.length) return
          const blob = new Blob(blobs),
            name = `artbot-${job.id}-${String(index + 1).padStart(
              4,
              '0'
            )}.artbot-part`
          const metadata = {
            name,
            size: blob.size,
            sha256: await sha(await blob.arrayBuffer()),
            index
          }
          await this.catalog.table('parts').put({ job: job.id, index, slices })
          parts.push(metadata)
          index++
          slices = []
          blobs = []
          bytes = 0
        }
        await this.catalog.table('parts').where('job').equals(job.id).delete()
        for (let ordinal = 0; ordinal <= job.records; ordinal++) {
          checkCancelled(options.signal)
          await this.checkLease()
          const row = await this.catalog.table('records').get([job.id, ordinal])
          for (let line = 0; line < row.lines.length; line++) {
            const blob: Blob = row.lines[line]
            if (bytes + blob.size > job.maxPartBytes) await flush()
            blobs.push(blob)
            slices.push({ ordinal, line })
            bytes += blob.size
          }
          progress('building parts')
        }
        await flush()
        const manifest: Manifest = {
          format: 'artbot-backup',
          version: 1,
          complete: true,
          id: job.id,
          createdAt: job.createdAt,
          origin: typeof location !== 'undefined' ? location.origin : 'unknown',
          standalone:
            typeof navigator !== 'undefined' &&
            ((typeof matchMedia === 'function' &&
              matchMedia('(display-mode: standalone)').matches) ||
              !!(navigator as any).standalone),
          appBuild: this.getBuild(),
          schema,
          chunkBytes: job.chunkBytes,
          maxPartBytes: job.maxPartBytes,
          records: job.records,
          preferencesDigest: preferences.fingerprint,
          credentialsIncluded: job.includeCredentials,
          tables: job.tables,
          parts
        }
        job.manifest = manifest
        job.status = 'complete'
        await this.catalog.table('jobs').put(job)
        this.publishHandoff(job)
        return job
      } catch (e) {
        // The in-memory cursor may be ahead of a failed transaction. Only the
        // durable record+cursor checkpoint is safe to resume.
        const saved = await this.catalog
          .table('jobs')
          .get(job.id)
          .catch(() => undefined)
        if (saved)
          await this.catalog
            .table('jobs')
            .put({
              ...saved,
              status: ['AbortError', 'QuotaExceededError'].includes(
                (e as Error).name
              )
                ? 'paused'
                : 'failed',
              error: (e as Error).message
            })
            .catch(() => {})
        throw e
      }
    } finally {
      source.close()
    }
  }
  private handoffStatus(job: any): BackupHandoff {
    const names = [
      `artbot-${job.id}.manifest.json`,
      ...job.manifest.parts.map((p: Manifest['parts'][number]) => p.name)
    ]
    return {
      id: job.id,
      records: job.records,
      complete: !!job.delivery?.verifiedAt,
      files: names.map((name) => ({
        name,
        requested: !!job.delivery?.requested?.includes(name),
        verified: !!job.delivery?.verified?.includes(name)
      }))
    }
  }
  private publishHandoff(job: any) {
    // The small hint makes unfinished work discoverable without loading the engine
    // on every route. The catalog remains the authority for actual verification.
    try {
      const status =
        job.status === 'complete' ? this.handoffStatus(job) : undefined
      this.storage.setItem(
        `${this.selectionKey}:handoff`,
        JSON.stringify({
          id: job.id,
          state: status?.complete
            ? 'verified'
            : status
              ? 'saving'
              : 'preparing',
          verified: status?.files.filter((f) => f.verified).length || 0,
          total: status?.files.length || 0
        })
      )
      if (typeof window !== 'undefined')
        window.dispatchEvent(new Event(HANDOFF_EVENT))
    } catch {
      // Storage estimates and the home-page hint are advisory. Prepared data and
      // progress remain durable in the catalog even when localStorage is full.
    }
  }
  private async preparedJob(id: string) {
    const job = await this.catalog.table('jobs').get(id)
    if (!job?.manifest || job.status !== 'complete')
      throw new Error('Backup preparation is incomplete')
    return job
  }
  async handoff(id: string): Promise<BackupHandoff> {
    return this.handoffStatus(await this.preparedJob(id))
  }
  async noteSaveRequested(id: string, name: string) {
    const saved = await this.catalog.transaction(
      'rw',
      this.catalog.table('jobs'),
      async () => {
        const job = await this.preparedJob(id)
        if (!this.handoffStatus(job).files.some((f) => f.name === name))
          throw new Error('Unknown backup file')
        job.delivery = {
          ...job.delivery,
          requested: [...new Set([...(job.delivery?.requested || []), name])]
        }
        await this.catalog.table('jobs').put(job)
        return job
      }
    )
    this.publishHandoff(saved)
  }
  async file(id: string, name: string): Promise<File> {
    return this.preparedFile(await this.preparedJob(id), name)
  }
  private async preparedFile(job: any, name: string): Promise<File> {
    const id = job.id
    if (name === `artbot-${id}.manifest.json`)
      return new File([JSON.stringify(job.manifest, null, 2)], name, {
        type: 'application/json'
      })
    const part = (job.manifest as Manifest).parts.find((p) => p.name === name)
    if (!part) throw new Error('Unknown backup file')
    const metadata = await this.catalog.table('parts').get([id, part.index]),
      blobs: Blob[] = []
    if (!metadata) throw new Error('The local preparation is missing a part')
    let previous = -1,
      row: any
    for (const ref of metadata.slices) {
      if (previous !== ref.ordinal) {
        row = await this.catalog.table('records').get([id, ref.ordinal])
        previous = ref.ordinal
      }
      if (!row?.lines?.[ref.line])
        throw new Error('The local preparation is incomplete')
      blobs.push(row.lines[ref.line])
    }
    return new File(blobs, name, { type: 'application/octet-stream' })
  }
  async inventory(id: string): Promise<BackupInventory> {
    const job = await this.preparedJob(id)
    const status = this.handoffStatus(job)
    return {
      id,
      createdAt: job.createdAt,
      records: job.records,
      images:
        job.manifest.tables.find(
          (table: Manifest['tables'][number]) => table.name === 'completed'
        )?.count || 0,
      includeCredentials: job.manifest.credentialsIncluded === true,
      complete: status.complete,
      files: status.files.map((entry, index) => ({
        ...entry,
        size:
          index === 0
            ? new TextEncoder().encode(JSON.stringify(job.manifest, null, 2))
                .byteLength
            : job.manifest.parts[index - 1].size,
        label: index === 0 ? 'manifest' : 'part ' + index
      }))
    }
  }
  async files(id: string): Promise<File[]> {
    const job = await this.preparedJob(id),
      status = this.handoffStatus(job),
      files: File[] = []
    for (const entry of status.files)
      files.push(await this.preparedFile(job, entry.name))
    return files
  }
  async verifySavedFiles(
    id: string,
    files: File[],
    signal?: AbortSignal
  ): Promise<BackupHandoff> {
    assertBackupFilesAvailable(files)
    return this.exclusive(
      'Verifying saved backup files',
      async () => {
        const job = await this.preparedJob(id),
          status = this.handoffStatus(job)
        if (
          !files.length ||
          new Set(files.map((f) => f.name)).size !== files.length
        )
          throw new Error('Choose unique saved backup files')
        const checked: string[] = []
        for (const file of files) {
          checkCancelled(signal)
          const expected = (job.manifest as Manifest).parts.find(
            (p) => p.name === file.name
          )
          const manifest =
            file.name === status.files[0].name
              ? await this.preparedFile(job, file.name)
              : undefined
          if (!expected && !manifest)
            throw new Error(
              'These files belong to a different backup. Choose files from this prepared set.'
            )
          const expectedSize = expected?.size ?? manifest!.size
          const expectedHash =
            expected?.sha256 ?? (await sha(await manifest!.arrayBuffer()))
          if (
            file.size !== expectedSize ||
            (await sha(await file.arrayBuffer())) !== expectedHash
          )
            throw new Error(`Missing or damaged backup file: ${file.name}`)
          checked.push(file.name)
        }
        checkCancelled(signal)
        job.delivery = {
          ...job.delivery,
          verified: [
            ...new Set([...(job.delivery?.verified || []), ...checked])
          ]
        }
        if (status.files.every((f) => job.delivery.verified.includes(f.name))) {
          // Saved copies match the prepared bytes; still audit the complete graph,
          // table counts and fingerprints before recording successful verification.
          for await (const row of bundleRecords(
            {
              manifest: job.manifest,
              files: { get: (name) => this.preparedFile(job, name) }
            },
            signal
          ))
            void row
          checkCancelled(signal)
          job.delivery.verifiedAt = new Date().toISOString()
        }
        await this.checkLease()
        await this.catalog.transaction(
          'rw',
          this.catalog.table('jobs'),
          async () => {
            const latest = await this.preparedJob(id)
            job.delivery = {
              ...latest.delivery,
              ...job.delivery,
              requested: latest.delivery?.requested || [],
              verified: [
                ...new Set([
                  ...(latest.delivery?.verified || []),
                  ...job.delivery.verified
                ])
              ],
              verifiedAt: job.delivery.verifiedAt || latest.delivery?.verifiedAt
            }
            await this.catalog
              .table('jobs')
              .update(id, { delivery: job.delivery })
          }
        )
        this.publishHandoff(job)
        let verificationRecorded = true
        if (job.delivery.verifiedAt) {
          try {
            this.storage.setItem(
              `${this.selectionKey}:lastVerified`,
              JSON.stringify({ id, time: Date.now(), records: job.records })
            )
          } catch {
            verificationRecorded = false
          }
        }
        return { ...this.handoffStatus(job), verificationRecorded }
      },
      { readOnlySource: true }
    )
  }
  async verify(files: Blob[], signal?: AbortSignal) {
    const bundle = await inspectBundle(files, signal)
    let preferences: any
    for await (const row of bundleRecords(bundle, signal))
      if (row.table === '@preferences') preferences = row.value
    const prepared = await this.catalog.table('jobs').get(bundle.manifest.id)
    if (
      prepared?.status === 'complete' &&
      (await hashJSON(prepared.manifest)) === (await hashJSON(bundle.manifest))
    ) {
      const saved = await this.catalog.transaction(
        'rw',
        this.catalog.table('jobs'),
        async () => {
          const latest = await this.catalog.table('jobs').get(prepared.id)
          if (!latest) return
          latest.delivery = {
            ...latest.delivery,
            verified: this.handoffStatus(latest).files.map((f) => f.name),
            verifiedAt: new Date().toISOString()
          }
          await this.catalog.table('jobs').put(latest)
          return latest
        }
      )
      if (saved) this.publishHandoff(saved)
    }
    let verificationRecorded = true
    try {
      this.storage.setItem(
        `${this.selectionKey}:lastVerified`,
        JSON.stringify({
          id: bundle.manifest.id,
          time: Date.now(),
          records: bundle.manifest.records
        })
      )
    } catch {
      verificationRecorded = false
    }

    return {
      ...bundle.manifest,
      preferences: preferences.appConfig,
      localPreferences: preferences.localPreferences,
      verificationRecorded
    }
  }
  async discardPreparation(id: string) {
    return this.exclusive('Removing a local backup preparation', async () => {
      await this.catalog.transaction(
        'rw',
        this.catalog.table('jobs'),
        this.catalog.table('records'),
        this.catalog.table('parts'),
        async () => {
          await this.catalog.table('records').where('job').equals(id).delete()
          await this.catalog.table('parts').where('job').equals(id).delete()
          await this.catalog.table('jobs').delete(id)
        }
      )
      try {
        const key = `${this.selectionKey}:handoff`
        if (JSON.parse(this.storage.getItem(key) || 'null')?.id === id) {
          this.storage.removeItem(key)
          if (typeof window !== 'undefined')
            window.dispatchEvent(new Event(HANDOFF_EVENT))
        }
      } catch {
        /* The catalog remains authoritative. */
      }
    })
  }
  async discardAttempt(id: string) {
    return this.exclusive('Removing an incomplete restore', async () => {
      const attempt = await this.catalog.table('restores').get(id),
        active = selection(this.storage, this.selectionKey)
      if (
        !attempt ||
        !['paused', 'failed', 'staging', 'verified'].includes(attempt.status) ||
        attempt.name === this.activeDatabase ||
        attempt.name === active?.previousName ||
        attempt.name !== `artbot-restored-${id}`
      )
        throw new Error(
          'This library is retained for recovery and cannot be removed here'
        )
      await Dexie.delete(attempt.name)
      await this.catalog.table('restores').delete(id)
    })
  }
  async exportCompatibility(onProgress?: (progress: any) => void) {
    return this.exclusive('Exporting compatibility JSON', () =>
      compatibilityExport(this.activeDatabase, onProgress)
    )
  }
  async restore(
    files: Blob[],
    options: RestoreOptions = {}
  ): Promise<RestoreReport> {
    return this.exclusive('Restoring a library', () =>
      this.restoreFiles(files, options)
    )
  }
  private async restoreFiles(
    files: Blob[],
    options: RestoreOptions
  ): Promise<RestoreReport> {
    assertBackupFilesAvailable(files)
    await assertHeadroom(
      restoreSpaceRequired(files.reduce((bytes, file) => bytes + file.size, 0))
    )
    if (files.some((f) => (f as File).name?.endsWith('.manifest.json')))
      return this.restoreBundle(files, options)
    if (files.length !== 1) throw new Error('Select one legacy recovery file')
    if ((await files[0].slice(0, 256).text()).trimStart().startsWith('{'))
      return this.restoreDexie(files[0], options)
    const id = crypto.randomUUID(),
      name = `artbot-restored-${id}`
    const before: Selection = this.captureSelection()
    const source = await openExisting(this.activeDatabase)
    let target: IDBDatabase
    try {
      target = await createDatabase(name, await describe(source))
    } catch (error) {
      source.close()
      throw error
    }
    let recovered = 0,
      duplicates = 0
    try {
      await this.catalog.table('restores').put({
        id,
        name,
        before,
        status: 'staging',
        createdAt: Date.now(),
        format: 'legacy-array'
      })
      const expected = new Map<string, Map<string, string>>()
      for (const table of source.objectStoreNames) {
        const values = new Map<string, string>()
        expected.set(table, values)
        for await (const row of records(source, table)) {
          checkCancelled(options.signal)
          await this.checkLease()
          values.set(
            (await encodeRecord('key', row.key, null)).fingerprint,
            (await encodeRecord(table, row.key, row.value)).fingerprint
          )
          await putRecord(target, table, row.value, row.key)
        }
      }
      const sourceDigests = new Map(
        [...expected].map(([table, values]) => [table, new Map(values)])
      )
      for await (const original of legacyRows(files[0], options.signal)) {
        await this.checkLease()
        checkCancelled(options.signal)
        const row = { ...original }
        if (
          row.jobId &&
          target
            .transaction('completed')
            .objectStore('completed')
            .indexNames.contains('jobId')
        ) {
          const exists = await new Promise<boolean>((resolve, reject) => {
            const lookup = target
              .transaction('completed')
              .objectStore('completed')
              .index('jobId')
              .openCursor(IDBKeyRange.only(row.jobId as IDBValidKey))
            lookup.onerror = () => reject(lookup.error)
            lookup.onsuccess = () => {
              const cursor = lookup.result
              if (!cursor) {
                resolve(false)
                return
              }
              const existing = cursor.value
              const distinctHordeImage =
                row.hordeImageId &&
                existing.hordeImageId &&
                row.hordeImageId !== existing.hordeImageId
              const distinctPixels =
                typeof row.base64String === 'string' &&
                typeof existing.base64String === 'string' &&
                row.base64String !== existing.base64String
              if (!distinctHordeImage && !distinctPixels) resolve(true)
              else cursor.continue()
            }
          })
          if (exists) {
            duplicates++
            continue
          }
        }
        if (
          row.id !== undefined &&
          (await request(
            target
              .transaction('completed')
              .objectStore('completed')
              .get(row.id as IDBValidKey)
          ))
        )
          delete row.id
        const key = await putRecord(target, 'completed', row)
        const saved = await request(
          target.transaction('completed').objectStore('completed').get(key)
        )
        // Account for an auto-generated inline primary key without normalizing
        // any other legacy fields.
        const keyPath = target
          .transaction('completed')
          .objectStore('completed').keyPath
        if (typeof keyPath === 'string' && !keyPath.includes('.'))
          row[keyPath] = key
        const fingerprint = (await encodeRecord('completed', key, row))
          .fingerprint
        if (
          (await encodeRecord('completed', key, saved)).fingerprint !==
          fingerprint
        )
          throw new Error('Legacy image verification failed')
        expected
          .get('completed')!
          .set((await encodeRecord('key', key, null)).fingerprint, fingerprint)
        recovered++
        options.onProgress?.({
          phase: 'recovering legacy images',
          records: recovered,
          total: 0,
          bytes: files[0].size
        })
      }
      const audit = async (
        database: IDBDatabase,
        tables: Map<string, Map<string, string>>
      ) => {
        for (const [table, values] of tables) {
          let count = 0
          for await (const row of records(database, table)) {
            checkCancelled(options.signal)
            await this.checkLease()
            count++
            if (
              values.get(
                (await encodeRecord('key', row.key, null)).fingerprint
              ) !== (await encodeRecord(table, row.key, row.value)).fingerprint
            )
              throw new Error('Library changed during legacy recovery')
          }
          if (count !== values.size)
            throw new Error('Legacy recovery count mismatch')
        }
      }
      await audit(source, sourceDigests)
      await audit(target, expected)
      await this.catalog.table('restores').update(id, {
        verified: true,
        status: 'verified',
        recovered,
        duplicates
      })
      await this.checkLease()
      await this.prepareSelection(before)
      await this.selectLibrary(
        {
          name,
          generation: id,
          restoreId: id,
          previousName: before.name,
          appConfig: before.appConfig,
          localPreferences: before.localPreferences,
          jobsPaused: true
        } satisfies Selection,
        before,
        options.signal
      )
      return { id, database: name, recovered, duplicates, verified: true }
    } catch (error) {
      target.close()
      await Dexie.delete(name)
      await this.catalog
        .table('restores')
        .update(id, { status: 'failed', error: (error as Error).message })
        .catch(() => {})
      throw error
    } finally {
      source.close()
      target.close()
    }
  }
  private async restoreBundle(
    files: Blob[],
    options: RestoreOptions
  ): Promise<RestoreReport> {
    const bundle = await inspectBundle(files, options.signal)
    const manifestHash = await hashJSON(bundle.manifest)
    const previous = options.resumeId
      ? await this.catalog.table('restores').get(options.resumeId)
      : undefined
    if (
      options.resumeId &&
      (!previous ||
        previous.manifestHash !== manifestHash ||
        previous.before.name !== this.activeDatabase ||
        !['paused', 'staging', 'verified'].includes(previous.status))
    )
      throw new Error(
        'This restore cannot be resumed with these files and the current library'
      )
    if (previous) this.assertSelection(previous.before)
    const id = previous?.id || crypto.randomUUID(),
      name = previous?.name || `artbot-restored-${id}`
    const before: Selection = this.captureSelection()
    await this.catalog.table('restores').put({
      id,
      name,
      before,
      manifestHash,
      status: 'staging',
      createdAt: previous?.createdAt || Date.now(),
      format: 'multipart'
    })
    const target = previous
      ? await openExisting(name)
      : await createDatabase(name, bundle.manifest.schema)
    try {
      let recovered = 0
      let savedPreferences:
        | {
            appConfig: Record<string, unknown>
            localPreferences: Record<string, string>
          }
        | undefined
      for await (const row of bundleRecords(bundle, options.signal)) {
        if (row.table === '@preferences') {
          savedPreferences = row.value
          continue
        }
        await this.checkLease()
        const store = target.transaction(row.table).objectStore(row.table)
        const existingKey = await request(store.getKey(row.key))
        if (existingKey !== undefined) {
          const existingValue = await request(
            target.transaction(row.table).objectStore(row.table).get(row.key)
          )
          if (
            (
              await encodeRecord(
                row.table,
                row.key,
                existingValue,
                bundle.manifest.chunkBytes
              )
            ).fingerprint !== row.fingerprint
          )
            throw new Error('The partial restore changed; start a new restore')
        } else {
          const actualKey = await putRecord(
            target,
            row.table,
            row.value,
            row.key
          )
          if (indexedDB.cmp(actualKey, row.key) !== 0)
            throw new Error('Restored primary key mismatch')
        }
        recovered++
        options.onProgress?.({
          phase: 'restoring',
          records: recovered,
          total: bundle.manifest.records,
          bytes: 0
        })
      }
      // Read the committed candidate back; a parser success alone is insufficient.
      const digests = new Map<string, { count: number; digest: string }>()
      for (const table of bundle.manifest.tables) {
        const state = { count: 0, digest: '' }
        digests.set(table.name, state)
        for await (const row of records(target, table.name)) {
          checkCancelled(options.signal)
          state.count++
          state.digest = await hashJSON([
            state.digest,
            (
              await encodeRecord(
                table.name,
                row.key,
                row.value,
                bundle.manifest.chunkBytes
              )
            ).fingerprint
          ])
        }
        if (state.count !== table.count || state.digest !== table.digest)
          throw new Error(`Restored data verification failed for ${table.name}`)
      }
      const restoreCredentials =
        options.restoreCredentials && bundle.manifest.credentialsIncluded
      const preferences = safePreferences(
        savedPreferences!.appConfig,
        !!restoreCredentials
      )
      if (!restoreCredentials)
        for (const [key, value] of Object.entries(before.appConfig || {}))
          if (credentialPreference(key)) preferences[key] = value
      await this.catalog
        .table('restores')
        .update(id, { before, verified: true, status: 'verified', recovered })
      await this.checkLease()
      checkCancelled(options.signal)
      await this.prepareSelection(before)
      await this.selectLibrary(
        {
          name,
          generation: id,
          restoreId: id,
          previousName: before.name,
          appConfig: preferences,
          localPreferences: savedPreferences!.localPreferences,
          jobsPaused: true
        } satisfies Selection,
        before,
        options.signal
      )
      return { id, database: name, recovered, duplicates: 0, verified: true }
    } catch (e) {
      const name = (e as Error).name
      const attempt = await this.catalog
        .table('restores')
        .get(id)
        .catch(() => undefined)
      await this.catalog
        .table('restores')
        .update(id, {
          status: attempt?.verified
            ? 'verified'
            : ['AbortError', 'QuotaExceededError'].includes(name)
              ? 'paused'
              : 'failed',
          error: (e as Error).message
        })
        .catch(() => {})
      throw e
    } finally {
      target.close()
    }
  }
  private async restoreDexie(
    file: Blob,
    options: RestoreOptions
  ): Promise<RestoreReport> {
    const id = crypto.randomUUID(),
      name = `artbot-restored-${id}`
    const before: Selection = this.captureSelection()
    await this.catalog
      .table('restores')
      .put({ id, name, before, status: 'staging', createdAt: Date.now() })
    try {
      const result = await importLegacyDexie(
        file,
        name,
        options.signal,
        (records, total) =>
          options.onProgress?.({
            phase: 'restoring',
            records,
            total,
            bytes: file.size
          })
      )
      await this.checkLease()
      checkCancelled(options.signal)
      await this.catalog.table('restores').update(id, {
        verified: true,
        status: 'verified',
        recovered: result.records
      })
      await this.prepareSelection(before)
      await this.selectLibrary(
        {
          name,
          generation: id,
          restoreId: id,
          previousName: before.name,
          appConfig: before.appConfig,
          localPreferences: before.localPreferences,
          jobsPaused: true
        } satisfies Selection,
        before,
        options.signal
      )
      return {
        id,
        database: name,
        recovered: result.records,
        duplicates: 0,
        verified: true
      }
    } catch (e) {
      await Dexie.delete(name)
      await this.catalog
        .table('restores')
        .update(id, { status: 'failed', error: (e as Error).message })
      throw e
    }
  }
  async rollback() {
    return this.exclusive('Returning to the previous library', () =>
      this.rollbackSelected()
    )
  }
  private async rollbackSelected() {
    const current = selection(this.storage, this.selectionKey)
    if (!current?.restoreId) throw new Error('No previous library is available')
    const restore = await this.catalog.table('restores').get(current.restoreId)
    if (!restore?.before)
      throw new Error('Previous library metadata is unavailable')
    const previous = await openExisting(restore.before.name)
    previous.close()
    await this.prepareSelection(current)
    await this.selectLibrary(
      { ...restore.before, generation: crypto.randomUUID() },
      current
    )
  }
  async close() {
    this.catalog.close()
  }
}
