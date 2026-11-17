// Synthetic only. Never read a user's archive or browser profile here.
const { readFile } = require('node:fs/promises')
const path = require('node:path')
const { createHash } = require('node:crypto')
const assert = require('node:assert/strict')

const favoriteLoras = '{"simulator-fixture":true}'

async function makeFixture() {
  const archive = JSON.parse(
    await readFile(
      path.join(__dirname, '../../e2e/fixtures/legacy-backup.json')
    )
  )
  const row = archive.data.data[0].rows.find(
    (entry) => entry.jobId === 'img2img-with-blob'
  )
  const mask = Buffer.from(row.base64String, 'base64')
  const source = Buffer.alloc(7 * 1048576, 93)
  mask.copy(source)
  for (const [field, bytes] of [
    ['source_image', source],
    ['source_mask', mask]
  ]) {
    row[field] = { type: 'image/png', data: bytes.toString('base64') }
    row.$types[field] = 'blob2'
  }
  return {
    buffer: Buffer.from(JSON.stringify(archive)),
    expected: {
      counts: {
        completed: 3,
        pending: 2,
        prompts: 1,
        images: 1,
        projects: 1,
        tags: 1,
        imageProjects: 1,
        imageTags: 1,
        settings: 1
      },
      favorites: 1,
      sourceBytes: source.length,
      sourceSHA256: createHash('sha256').update(source).digest('hex'),
      maskBytes: mask.length,
      maskSHA256: createHash('sha256').update(mask).digest('hex'),
      favoriteLoras
    }
  }
}

// Serialized into the tested browser. Read native IDB, bypassing Dexie hooks.
// Reading every row is safe here because this fixture contains only 12 records.
/** @param {((phase: string) => void) | void} [progress] */
async function auditLibrary(progress) {
  progress = typeof progress === 'function' ? progress : () => {}
  const name = window._artbotDb?.name
  if (!name) throw Error('The application database is not ready')
  const open = (database) =>
    new Promise((resolve, reject) => {
      const request = indexedDB.open(database)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  const readTables = (database, names) =>
    new Promise((resolve, reject) => {
      // Queue all reads together and wait for the transaction to commit.
      // This is one consistent snapshot, without yielding between table reads
      // while the application's background database work is running.
      const transaction = database.transaction(names, 'readonly')
      const tables = {}
      for (const name of names) {
        const request = transaction.objectStore(name).getAll()
        request.onsuccess = () => {
          tables[name] = request.result
        }
      }
      transaction.oncomplete = () => resolve(tables)
      transaction.onabort = () =>
        reject(transaction.error || Error('Native audit transaction aborted'))
      transaction.onerror = () => reject(transaction.error)
    })
  progress(`Opening ${name}`)
  const db = await open(name)
  const counts = {}
  let tables
  try {
    progress(`Reading ${name} in one native transaction`)
    tables = await readTables(db, [...db.objectStoreNames])
    for (const table of db.objectStoreNames) {
      counts[table] = tables[table].length
    }
  } finally {
    db.close()
  }
  progress('Listing native databases')
  const databases = await indexedDB.databases()
  let preparations = 0
  if (databases.some((entry) => entry.name === 'ArtBotBackupCatalog')) {
    progress('Reading preparation catalog')
    const catalog = await open('ArtBotBackupCatalog')
    try {
      preparations = (await readTables(catalog, ['jobs'])).jobs.length
    } finally {
      catalog.close()
    }
  }
  const result = {
    name,
    counts,
    preparations,
    standalone: navigator.standalone === true,
    secure: isSecureContext,
    selection: JSON.parse(
      localStorage.getItem('ArtBotLibrarySelection') || 'null'
    ),
    handoff: JSON.parse(
      localStorage.getItem('ArtBotLibrarySelection:handoff') || 'null'
    ),
    lastVerified: JSON.parse(
      localStorage.getItem('ArtBotLibrarySelection:lastVerified') || 'null'
    ),
    favoriteLoras: localStorage.getItem('favoriteLoras'),
    favorites: tables.completed.filter((row) => row.favorited).length
  }
  const row = tables.completed.find(
    (entry) => entry.jobId === 'img2img-with-blob'
  )
  if (row) {
    progress('Hashing source and mask')
    const hash = async (blob) =>
      Array.from(
        new Uint8Array(
          await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())
        ),
        (byte) => byte.toString(16).padStart(2, '0')
      ).join('')
    Object.assign(result, {
      sourceBytes: row.source_image.size,
      sourceSHA256: await hash(row.source_image),
      maskBytes: row.source_mask.size,
      maskSHA256: await hash(row.source_mask)
    })
  }
  progress('Finished')
  return result
}

function assertFresh(result) {
  assert.equal(result.name, 'imageHorde')
  assert.ok(Object.values(result.counts).every((count) => count === 0))
  assert.equal(result.preparations, 0)
  assert.equal(result.handoff, null)
  assert.equal(result.selection, null)
}

function assertFixture(result, expected) {
  for (const key of Object.keys(expected))
    assert.deepEqual(result[key], expected[key], key)
  assert.match(result.name, /^artbot-restored-/)
  assert.equal(result.selection.jobsPaused, true)
}

module.exports = {
  favoriteLoras,
  makeFixture,
  auditLibrary,
  assertFresh,
  assertFixture
}
