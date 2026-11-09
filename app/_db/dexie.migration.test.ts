/**
 * Users' images exist only in their browser's IndexedDB. These tests build a
 * database as it looked at each historical schema version, upgrade it with the
 * current code, and assert that nothing was lost.
 *
 * SCHEMA_HISTORY is deliberately a frozen copy rather than an import from
 * dexie.ts: it records what is already on users' machines. If you add a schema
 * version, append it here. Never edit an existing entry.
 */
import 'fake-indexeddb/auto'
import Dexie from 'dexie'
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
  const legacy = new Dexie(DB_NAME)
  legacy.version(version).stores(SCHEMA_HISTORY[version])
  await legacy.open()

  for (const table of legacy.tables) {
    await table.bulkPut(SEED_ROWS[table.name])
  }

  legacy.close()
  return Object.keys(SCHEMA_HISTORY[version])
}

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

  beforeEach(async () => {
    await Dexie.delete(DB_NAME)
    db = new MySubClassedDexie()
  })

  afterEach(() => {
    db.close()
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
