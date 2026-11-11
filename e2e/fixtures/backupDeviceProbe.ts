// Disposable engine probe for Safari Web Inspector. No application database,
// selection or preference storage is read or written. The same public module
// used by Settings operates only on these explicitly created test resources.
import Dexie from 'dexie'
import { BackupManager } from '../../app/_backup/manager'
class ProbeStorage implements Storage {
  private values = new Map<string, string>()
  get length() {
    return this.values.size
  }
  key(i: number) {
    return [...this.values.keys()][i] || null
  }
  clear() {
    this.values.clear()
  }
  getItem(key: string) {
    return this.values.get(key) ?? null
  }
  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
  removeItem(key: string) {
    this.values.delete(key)
  }
}
const req = <T>(r: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    r.onsuccess = () => resolve(r.result)
    r.onerror = () => reject(r.error)
  })
const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message)
}
let running = false
async function run(bytesPerRow = 1024 * 1024) {
  if (running) throw new Error('Probe already running')
  if (
    !Number.isInteger(bytesPerRow) ||
    bytesPerRow < 1 ||
    bytesPerRow > 64 * 1024 * 1024
  )
    throw new Error('Probe size must be 1 byte to 64 MiB')
  running = true
  const name = `artbot-device-probe-${crypto.randomUUID()}`,
    catalogName = `${name}-catalog`,
    storage = new ProbeStorage()
  let source: IDBDatabase | undefined,
    manager = new BackupManager({
      storage,
      defaultDatabase: name,
      catalogName,
      selectionKey: `${name}-selection`
    })
  const started = performance.now(),
    timings: { phase: string; elapsedMs: number }[] = []
  const progress = (phase: string) => {
    const update = { phase, elapsedMs: performance.now() - started }
    timings.push(update)
    ;(window as any).ArtBotBackupProbe.progress = phase
    ;(window as any).ArtBotBackupProbe.onProgress?.(update)
  }
  try {
    progress('seeding disposable records')
    const open = indexedDB.open(name, 60)
    open.onupgradeneeded = () => {
      open.result
        .createObjectStore('completed', { keyPath: 'id', autoIncrement: true })
        .createIndex('jobId', 'jobId')
      open.result.createObjectStore('settings', { keyPath: 'id' })
    }
    source = await req(open)
    for (let id = 1; id <= 3; id++)
      await req(
        source
          .transaction('completed', 'readwrite')
          .objectStore('completed')
          .add({
            id,
            jobId: `probe-${id}`,
            favorited: id === 1,
            model: 'legacy',
            source_image: new Blob([new Uint8Array(bytesPerRow).fill(id)], {
              type: 'image/test'
            }),
            source_mask: new Blob(['mask']),
            when: new Date('2020-01-02T00:00:00Z')
          })
      )
    const abort = new AbortController()
    try {
      await manager.prepare({
        maxPartBytes: 2 * 1024 * 1024,
        signal: abort.signal,
        onProgress: (p) => {
          if (p.records === 1) abort.abort()
        }
      })
      throw new Error('Cancellation was ignored')
    } catch (e) {
      if ((e as Error).name !== 'AbortError') throw e
    }
    const [job] = await manager.preparations()
    assert(
      job.status === 'paused' && job.records === 1,
      'Checkpoint did not pause after one row'
    )
    await manager.close()
    manager = new BackupManager({
      storage,
      defaultDatabase: name,
      catalogName,
      selectionKey: `${name}-selection`
    })
    progress('resuming preparation after manager reopen')
    const complete = await manager.prepare({
        resumeId: job.id,
        onProgress: (p) => {
          ;(window as any).ArtBotBackupProbe.progress =
            `${p.phase}: ${p.records}`
        }
      }),
      files = await manager.files(complete.id)
    await manager.verify(files)
    assert(
      files.slice(1).every((f) => f.size <= 2 * 1024 * 1024),
      'Part exceeded byte limit'
    )
    const corrupt = [...files]
    corrupt[1] = new File(['broken'], files[1].name)
    let rejected = false
    try {
      await manager.restore(corrupt)
    } catch {
      rejected = true
    }
    assert(
      rejected && manager.activeDatabase === name,
      'Corrupt backup changed selection'
    )
    progress('pausing and resuming staged restore')
    const cancel = new AbortController()
    try {
      await manager.restore(files, {
        signal: cancel.signal,
        onProgress: (p) => {
          if (p.records === 1) cancel.abort()
        }
      })
      throw new Error('Restore cancellation was ignored')
    } catch (e) {
      if ((e as Error).name !== 'AbortError') throw e
    }
    const [attempt] = await manager.restoreAttempts()
    assert(manager.activeDatabase === name, 'Partial restore selected')
    await manager.restore(files, { resumeId: attempt.id })
    const target = await req(indexedDB.open(manager.activeDatabase))
    try {
      assert(
        (await req(
          target.transaction('completed').objectStore('completed').count()
        )) === 3,
        'Record count mismatch'
      )
      const row: any = await req(
        target.transaction('completed').objectStore('completed').get(1)
      )
      const expected = await crypto.subtle.digest(
          'SHA-256',
          new Uint8Array(bytesPerRow).fill(1)
        ),
        actual = await crypto.subtle.digest(
          'SHA-256',
          await row.source_image.arrayBuffer()
        )
      assert(
        [...new Uint8Array(expected)].join() ===
          [...new Uint8Array(actual)].join(),
        'Blob bytes mismatch'
      )
      assert(
        row.favorited &&
          row.model === 'legacy' &&
          !('models' in row) &&
          row.when.toISOString() === '2020-01-02T00:00:00.000Z' &&
          (await row.source_mask.text()) === 'mask',
        'Raw fields changed'
      )
    } finally {
      target.close()
    }
    await manager.rollback()
    assert(manager.activeDatabase === name, 'Rollback failed')
    assert(
      (await req(
        source.transaction('completed').objectStore('completed').count()
      )) === 3,
      'Source changed'
    )
    const result = {
      passed: true,
      records: 3,
      sourceBytes: bytesPerRow * 3,
      parts: files.length - 1,
      engine: navigator.userAgent,
      standalone: !!(navigator as any).standalone,
      timings
    }
    progress('passed; removing disposable resources')
    return result
  } finally {
    source?.close()
    const attempts = await manager.restoreAttempts().catch(() => [])
    await manager.close()
    for (const attempt of attempts)
      if (attempt.name === `artbot-restored-${attempt.id}`)
        await Dexie.delete(attempt.name)
    await Dexie.delete(name)
    await Dexie.delete(catalogName)
    running = false
  }
}
Object.assign(window, { ArtBotBackupProbe: { run, progress: 'ready' } })

// Optional physical Files handoff check. This panel uses only synthetic data
// and an in-memory selection; it cannot switch the user's application library.
async function openFilesTest() {
  if (running) throw new Error('A disposable probe is already running')
  running = true
  let name = `artbot-device-probe-${crypto.randomUUID()}`,
    catalogName = `${name}-catalog`
  let resumeJob: any
  // Saving from an iPhone PWA may recreate its document. Find only our own
  // disposable catalogs and recover exactly the same manifest/part filenames.
  try {
    const databases = await indexedDB.databases()
    for (const database of databases) {
      if (
        !/^artbot-device-probe-[a-f0-9-]{36}-catalog$/.test(database.name || '')
      )
        continue
      const candidateName = database.name!.slice(0, -8)
      if (!databases.some((d) => d.name === candidateName)) continue
      const preview = new BackupManager({
        storage: new ProbeStorage(),
        defaultDatabase: candidateName,
        catalogName: database.name
      })
      try {
        for (const job of await preview.preparations())
          if (
            job.source === candidateName &&
            job.records === 3 &&
            job.status === 'complete' &&
            (!resumeJob || job.createdAt > resumeJob.createdAt)
          ) {
            resumeJob = job
            name = candidateName
            catalogName = database.name!
          }
      } finally {
        await preview.close()
      }
    }
  } catch (e) {
    running = false
    throw e
  }
  const manager = new BackupManager({
    storage: new ProbeStorage(),
    defaultDatabase: name,
    catalogName,
    selectionKey: `${name}-selection`
  })
  const panel = document.createElement('section')
  panel.setAttribute('role', 'dialog')
  panel.setAttribute('aria-label', 'Disposable backup Files test')
  panel.style.cssText =
    'position:fixed;inset:0;z-index:2147483647;overflow:auto;padding:24px;background:#14202c;color:white;font:16px system-ui;line-height:1.5'
  const title = document.createElement('h2')
  title.textContent = 'ArtBot backup Files test'
  panel.append(title)
  const help = document.createElement('p')
  help.textContent =
    'These are synthetic test images. Save the manifest and every part to one folder in Files. Return here, choose all saved files, then verify and restore the copies. Your image library is unchanged.'
  panel.append(help)
  const status = document.createElement('p')
  status.setAttribute('role', 'status')
  panel.append(status)
  const close = document.createElement('button')
  close.textContent = 'Close test panel'
  close.disabled = true
  panel.append(close)
  document.body.append(panel)
  let source: IDBDatabase | undefined,
    cleaned = false
  const cleanup = async () => {
    if (cleaned) return
    source?.close()
    const attempts = await manager.restoreAttempts()
    await manager.close()
    for (const attempt of attempts)
      if (attempt.name === `artbot-restored-${attempt.id}`)
        await Dexie.delete(attempt.name)
    await Dexie.delete(name)
    await Dexie.delete(catalogName)
    cleaned = true
    running = false
  }
  close.onclick = async () => {
    close.disabled = true
    try {
      await cleanup()
      panel.remove()
    } catch (e) {
      status.textContent = (e as Error).message
      close.disabled = false
    }
  }
  try {
    status.textContent = 'Preparing synthetic files. Keep this app visible.'
    const open = indexedDB.open(name, 60)
    open.onupgradeneeded = () => {
      open.result
        .createObjectStore('completed', { keyPath: 'id', autoIncrement: true })
        .createIndex('jobId', 'jobId')
      open.result.createObjectStore('settings', { keyPath: 'id' })
    }
    source = await req(open)
    if (!resumeJob)
      for (let id = 1; id <= 3; id++)
        await req(
          source
            .transaction('completed', 'readwrite')
            .objectStore('completed')
            .add({
              id,
              jobId: `files-test-${id}`,
              favorited: id === 1,
              source_image: new Blob([new Uint8Array(1048576).fill(id)], {
                type: 'image/test'
              }),
              source_mask: new Blob(['mask'])
            })
        )
    const job =
        resumeJob || (await manager.prepare({ maxPartBytes: 2 * 1048576 })),
      files = await manager.files(job.id)
    for (const [index, file] of files.entries()) {
      const button = document.createElement('button')
      button.textContent = index ? `Save part ${index}` : 'Save manifest'
      button.style.cssText =
        'display:block;margin:16px 0;padding:10px;background:#257381;color:white;border:1px solid white'
      button.onclick = () => {
        const url = URL.createObjectURL(file),
          anchor = document.createElement('a')
        anchor.href = url
        anchor.download = file.name
        panel.append(anchor)
        anchor.click()
        anchor.remove()
        setTimeout(() => URL.revokeObjectURL(url), 60000)
        button.textContent += ' — download requested'
      }
      panel.append(button)
      if (navigator.canShare?.({ files: [file] })) {
        const share = document.createElement('button')
        share.textContent = index
          ? `Share/save part ${index}`
          : 'Share/save manifest'
        share.style.cssText = button.style.cssText
        share.onclick = async () => {
          try {
            await navigator.share({
              files: [file],
              title: 'ArtBot synthetic backup test'
            })
            status.textContent =
              'Share sheet closed. Save every file, then choose the saved copies below.'
          } catch (e) {
            status.textContent = `Share did not complete: ${(e as Error).name}. Try Save instead.`
          }
        }
        panel.append(share)
      }
    }
    const label = document.createElement('label')
    label.textContent = 'Choose the saved manifest and every part from Files'
    panel.append(label)
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    // Let Files select custom part types; the verifier checks their contents.
    input.setAttribute('aria-label', 'Saved test backup files')
    input.style.cssText = 'display:block;margin:16px 0'
    label.append(input)
    const restore = document.createElement('button')
    restore.textContent = 'Verify and restore saved copies'
    restore.disabled = true
    restore.style.cssText =
      'padding:12px;background:#257381;color:white;border:1px solid white'
    panel.append(restore)
    input.onchange = () => {
      restore.disabled = !input.files?.length
    }
    restore.onclick = async () => {
      restore.disabled = true
      close.disabled = true
      input.disabled = true
      try {
        const saved = Array.from(input.files || [])
        status.textContent = 'Checking the saved files…'
        await manager.verify(saved)
        await manager.restore(saved)
        const target = await req(indexedDB.open(manager.activeDatabase))
        try {
          assert(
            (await req(
              target.transaction('completed').objectStore('completed').count()
            )) === 3,
            'Restored count mismatch'
          )
          const first: any = await req(
            target.transaction('completed').objectStore('completed').get(1)
          )
          const actual = await crypto.subtle.digest(
              'SHA-256',
              await first.source_image.arrayBuffer()
            ),
            expected = await crypto.subtle.digest(
              'SHA-256',
              new Uint8Array(1048576).fill(1)
            )
          assert(
            [...new Uint8Array(actual)].join() ===
              [...new Uint8Array(expected)].join() &&
              first.favorited &&
              (await first.source_mask.text()) === 'mask',
            'Saved binary data mismatch'
          )
        } finally {
          target.close()
        }
        await manager.rollback()
        assert(manager.activeDatabase === name, 'Rollback failed')
        await cleanup()
        ;(window as any).ArtBotBackupProbe.filesResult = {
          passed: true,
          files: saved.length,
          records: 3,
          sourceBytes: 3 * 1048576,
          standalone: !!(navigator as any).standalone
        }
        status.textContent =
          'Passed: saved copies verified, restored and rolled back. Temporary databases removed. Close this panel to return to ArtBot.'
      } catch (e) {
        status.textContent = `Test did not pass: ${(e as Error).message}. Select a complete set of files and retry.`
        input.disabled = false
        restore.disabled = false
      } finally {
        close.disabled = false
      }
    }
    status.textContent = `${resumeJob ? 'Recovered the same prepared backup. Your saved manifest still matches these parts. ' : ''}Ready: save all ${files.length} files, then choose those saved copies below.`
    close.disabled = false
    return {
      ready: true,
      files: files.length,
      resumed: !!resumeJob,
      backupId: job.id,
      shareableFiles: files.filter((file) =>
        navigator.canShare?.({ files: [file] })
      ).length
    }
  } catch (e) {
    await cleanup()
    status.textContent = `Preparation failed: ${(e as Error).message}`
    close.disabled = false
    throw e
  }
}
;(window as any).ArtBotBackupProbe.openFilesTest = openFilesTest
