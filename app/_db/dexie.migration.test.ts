/**
 * Users' images exist only in their browser's IndexedDB. These tests build a
 * database as it looked at each historical schema version, upgrade it with the
 * current code, and assert that nothing was lost.
 *
 * SCHEMA_HISTORY is deliberately a frozen copy rather than an import from
 * dexie.ts: it records what is already on users' machines. If you add a schema
 * version, append it here. Never edit an existing entry.
 *
 * Every library on users' machines was created by Dexie 3, so the old
 * databases are built with Dexie 3.2.4 (the `dexie3` dev dependency). The
 * deployed site still runs Dexie 3, so these tests also reopen each upgraded
 * database with it, as a rollback would.
 */
import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import Dexie3 from 'dexie3'
import { MySubClassedDexie } from './dexie'

const DB_NAME = 'imageHorde'

const SCHEMA_HISTORY: Record<number, Record<string, string>> = {
  1: {
    completed: '++id, jobId, timestamp',
    pending: '++id, jobId,timestamp'
  },
  2: {
    completed: '++id, jobId, timestamp, parentJobId',
    pending: '++id, jobId,timestamp, parentJobId'
  },
  3: {
    completed: '++id, jobId, timestamp, parentJobId',
    pending: '++id, jobId,timestamp, parentJobId',
    prompts: '++id, timestamp, promptType'
  },
  4: {
    completed: '++id, jobId, timestamp, parentJobId',
    images: '++id, imageType, parentJobId, jobId',
    pending: '++id, jobId, timestamp, parentJobId, jobStatus',
    projects: '++id, name',
    prompts: '++id, timestamp, promptType',
    tags: '++id, name'
  },
  5: {
    completed: '++id, jobId, timestamp, parentJobId',
    images: '++id, imageType, parentJobId, jobId, type',
    imageProjects: '++id, projectId, imageId',
    imageTags: '++id, tagId, imageId',
    pending: '++id, jobId, timestamp, parentJobId, jobStatus',
    projects: '++id, name, type',
    prompts: '++id, timestamp, promptType',
    tags: '++id, name'
  },
  6: {
    completed: '++id, jobId, timestamp, parentJobId',
    images: '++id, imageType, parentJobId, jobId, type',
    imageProjects: '++id, projectId, imageId',
    imageTags: '++id, tagId, imageId',
    pending: '++id, jobId, timestamp, parentJobId, jobStatus',
    projects: '++id, name, type',
    prompts: '++id, timestamp, promptType',
    settings: '++id, name',
    tags: '++id, name'
  }
}

const VERSIONS = Object.keys(SCHEMA_HISTORY).map(Number)
const CURRENT_VERSION = Math.max(...VERSIONS)

// Roughly the size of a stored image, so truncation or re-encoding would show.
const IMAGE_BASE64 = 'UklGRlYAAABXRUJQVlA4'.repeat(50000)
const THUMBNAIL_BASE64 = 'dGh1bWJuYWls'.repeat(500)

const SEED_ROWS: Record<string, any[]> = {
  completed: [
    // The oldest records used a single `model` string and had no status.
    {
      id: 1,
      jobId: 'legacy-job',
      timestamp: 1665000000000,
      prompt: 'a legacy image ### with a negative',
      model: 'stable_diffusion',
      sampler: 'k_euler_a',
      steps: 20,
      cfg_scale: 7,
      seed: '12345',
      width: 512,
      height: 512,
      base64String: IMAGE_BASE64
    },
    {
      id: 2,
      jobId: 'child-job',
      parentJobId: 'parent-job',
      timestamp: 1700000000000,
      prompt: 'a newer image',
      negative: 'blurry',
      models: ['Deliberate'],
      sampler: 'k_dpmpp_2m',
      steps: 30,
      cfg_scale: 6.5,
      seed: '999',
      width: 1024,
      height: 768,
      karras: true,
      favorited: true,
      jobStatus: 'done',
      kudos: 12.5,
      hordeImageId: 'horde-image-id',
      loras: [{ name: '123', strength: 0.75 }],
      base64String: IMAGE_BASE64,
      thumbnail: THUMBNAIL_BASE64
    }
  ],
  pending: [
    {
      id: 1,
      jobId: 'pending-job',
      parentJobId: 'parent-job',
      timestamp: 1700000001000,
      jobStatus: 'waiting',
      prompt: 'still waiting',
      models: ['Deliberate'],
      numImages: 1
    }
  ],
  prompts: [
    { id: 1, timestamp: 1700000002000, promptType: 'prompt', prompt: 'saved' }
  ],
  images: [
    {
      id: 1,
      jobId: 'child-job',
      parentJobId: 'parent-job',
      imageType: 'image/webp',
      type: 'ab-test',
      hordeImageId: 'horde-image-id',
      base64String: IMAGE_BASE64,
      timestamp: 1700000003000
    }
  ],
  projects: [{ id: 1, name: 'My project', type: 'user' }],
  tags: [{ id: 1, name: 'landscape' }],
  imageProjects: [{ id: 1, projectId: 1, imageId: 2 }],
  imageTags: [{ id: 1, tagId: 1, imageId: 2 }],
  settings: [{ id: 1, name: 'favoriteModels', value: { Deliberate: true } }]
}

// Index columns that didn't exist yet at a version are simply unindexed fields.
const seedDatabaseAt = async (version: number) => {
  const legacy = new Dexie3(DB_NAME)
  legacy.version(version).stores(SCHEMA_HISTORY[version])
  await legacy.open()

  for (const table of legacy.tables) {
    await table.bulkPut(SEED_ROWS[table.name])
  }

  legacy.close()
  return Object.keys(SCHEMA_HISTORY[version])
}

// The deployed site: Dexie 3 with every schema version declared.
const openWithDeployedSite = async () => {
  const deployed = new Dexie3(DB_NAME)
  for (const version of VERSIONS) {
    deployed.version(version).stores(SCHEMA_HISTORY[version])
  }
  await deployed.open()
  return deployed
}

// Dexie stores version(n) as native IndexedDB version n * 10. Dexie 4 raises
// it above that when the installed schema lacks a declared table or index,
// and Dexie 3 then can't open the database at all.
const nativeVersion = () =>
  new Promise<number>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME)
    request.onsuccess = () => {
      resolve(request.result.version)
      request.result.close()
    }
    request.onerror = () => reject(request.error)
  })

const describeSchema = (db: Dexie) =>
  Object.fromEntries(
    db.tables.map((table) => [
      table.name,
      [table.schema.primKey.src, ...table.schema.indexes.map((i) => i.src)]
        .sort()
        .join(',')
    ])
  )

const normalizeDeclaredSchema = (schema: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(schema).map(([table, declaration]) => [
      table,
      declaration
        .split(',')
        .map((column) => column.trim())
        .sort()
        .join(',')
    ])
  )

describe('IndexedDB upgrades', () => {
  let db: MySubClassedDexie
  let warn: jest.SpyInstance

  const schemaDiffWarnings = () =>
    warn.mock.calls.filter((args) => String(args[0]).includes('SchemaDiff'))

  beforeEach(async () => {
    await Dexie.delete(DB_NAME)
    db = new MySubClassedDexie()
    warn = jest.spyOn(console, 'warn')
  })

  afterEach(() => {
    db.close()
    warn.mockRestore()
  })

  describe.each(VERSIONS)('from schema version %i', (version) => {
    let seededTables: string[]

    beforeEach(async () => {
      seededTables = await seedDatabaseAt(version)
      await db.open()
    })

    it('upgrades to the current version', () => {
      expect(db.verno).toBe(CURRENT_VERSION)
    })

    it('preserves every row exactly', async () => {
      for (const name of seededTables) {
        const rows = await db.table(name).orderBy(':id').toArray()
        expect({ table: name, rows }).toEqual({
          table: name,
          rows: SEED_ROWS[name]
        })
      }
    })

    it('creates every current table', () => {
      expect(db.tables.map((table) => table.name).sort()).toEqual(
        Object.keys(SCHEMA_HISTORY[CURRENT_VERSION]).sort()
      )
    })

    it('finds old rows through the indexes the app queries', async () => {
      const byJobId = await db.table('completed').get({ jobId: 'legacy-job' })
      expect(byJobId.base64String).toHaveLength(IMAGE_BASE64.length)

      const byTimestamp = await db
        .table('completed')
        .orderBy('timestamp')
        .keys()
      expect(byTimestamp).toEqual([1665000000000, 1700000000000])

      // parentJobId wasn't indexed in version 1, so this proves a backfill.
      const related = await db
        .table('completed')
        .where({ parentJobId: 'parent-job' })
        .toArray()
      expect(related.map((row) => row.jobId)).toEqual(['child-job'])

      const waiting = await db
        .table('pending')
        .where('jobStatus')
        .equals('waiting')
        .toArray()
      expect(waiting.map((row) => row.jobId)).toEqual(['pending-job'])
    })

    it('keeps data intact across a second open', async () => {
      db.close()
      const reopened = new MySubClassedDexie()
      await reopened.open()

      expect(await reopened.table('completed').count()).toBe(2)
      expect(reopened.verno).toBe(CURRENT_VERSION)

      reopened.close()
    })

    it('continues auto-incrementing past migrated ids', async () => {
      const newId = await db.table('completed').add({
        jobId: 'after-upgrade',
        timestamp: 1800000000000
      })

      expect(newId).toBe(3)
    })

    it('upgrades to the native version the deployed site opens', async () => {
      expect(await nativeVersion()).toBe(CURRENT_VERSION * 10)
      expect(schemaDiffWarnings()).toEqual([])
    })

    it('can still be opened by the deployed site afterwards', async () => {
      await db.table('completed').add({
        jobId: 'after-upgrade',
        timestamp: 1800000000000
      })
      db.close()

      const deployed = await openWithDeployedSite()
      expect(deployed.verno).toBe(CURRENT_VERSION)
      const completed = await deployed
        .table('completed')
        .orderBy(':id')
        .toArray()
      expect(completed.map((row) => row.jobId)).toEqual([
        'legacy-job',
        'child-job',
        'after-upgrade'
      ])
      for (const name of seededTables.filter(
        (table) => table !== 'completed'
      )) {
        expect(await deployed.table(name).toArray()).toEqual(SEED_ROWS[name])
      }
      deployed.close()

      // And back to the new site again.
      const reopened = new MySubClassedDexie()
      await reopened.open()
      expect(await reopened.table('completed').count()).toBe(3)
      reopened.close()
      expect(await nativeVersion()).toBe(CURRENT_VERSION * 10)
      expect(schemaDiffWarnings()).toEqual([])
    })
  })

  it('opens a library the deployed site created, without changing it', async () => {
    const deployed = await openWithDeployedSite()
    await deployed.table('completed').bulkPut(SEED_ROWS.completed)
    deployed.close()

    await db.open()
    expect(await db.table('completed').count()).toBe(2)
    expect(await nativeVersion()).toBe(CURRENT_VERSION * 10)
    expect(schemaDiffWarnings()).toEqual([])
  })

  it('creates the current schema for a brand new user', async () => {
    await db.open()

    expect(db.verno).toBe(CURRENT_VERSION)
    expect(await db.table('completed').count()).toBe(0)
  })

  // Fails when dexie.ts changes without a matching SCHEMA_HISTORY entry.
  it('declares exactly the frozen current schema', async () => {
    await db.open()

    expect(describeSchema(db)).toEqual(
      normalizeDeclaredSchema(SCHEMA_HISTORY[CURRENT_VERSION])
    )
  })
})
