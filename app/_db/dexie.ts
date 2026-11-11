import Dexie from 'dexie'
import { DATABASE_VERSION } from './version'
import {
  assertLibraryWritable,
  backupBusy,
  SELECTION_KEY,
  selection
} from 'app/_backup/platform'

export class MySubClassedDexie extends Dexie {
  completed: any
  images: any
  pending: any
  prompts: any
  settings: any

  constructor(name = selection()?.name || 'imageHorde') {
    super(name)
    this.version(1).stores({
      completed: '++id, jobId, timestamp',
      pending: '++id, jobId,timestamp'
    })

    this.version(2).stores({
      completed: '++id, jobId, timestamp, parentJobId',
      pending: '++id, jobId,timestamp, parentJobId'
    })

    this.version(3).stores({
      completed: '++id, jobId, timestamp, parentJobId',
      pending: '++id, jobId,timestamp, parentJobId',
      prompts: '++id, timestamp, promptType'
    })

    this.version(4).stores({
      completed: '++id, jobId, timestamp, parentJobId',
      images: '++id, imageType, parentJobId, jobId',
      pending: '++id, jobId, timestamp, parentJobId, jobStatus',
      projects: '++id, name',
      prompts: '++id, timestamp, promptType',
      tags: '++id, name'
    })

    this.version(5).stores({
      completed: '++id, jobId, timestamp, parentJobId',
      images: '++id, imageType, parentJobId, jobId, type',
      imageProjects: '++id, projectId, imageId',
      imageTags: '++id, tagId, imageId',
      pending: '++id, jobId, timestamp, parentJobId, jobStatus',
      projects: '++id, name, type',
      prompts: '++id, timestamp, promptType',
      tags: '++id, name'
    })

    this.version(DATABASE_VERSION).stores({
      completed: '++id, jobId, timestamp, parentJobId',
      images: '++id, imageType, parentJobId, jobId, type',
      imageProjects: '++id, projectId, imageId',
      imageTags: '++id, tagId, imageId',
      pending: '++id, jobId, timestamp, parentJobId, jobStatus',
      projects: '++id, name, type',
      prompts: '++id, timestamp, promptType',
      settings: '++id, name',
      tags: '++id, name'
    })

    // This is just to fail the build due to silliness on my part
    // const blah: number = 'fail me'
    // this.version(7).stores({
    //   completed: '++id, jobId, timestamp, parentJobId',
    //   images: '++id, imageType, parentJobId, jobId, type',
    //   imageProjects: '++id, projectId, imageId',
    //   imageTags: '++id, tagId, imageId',
    //   pending: '++id, jobId, timestamp, parentJobId, jobStatus',
    //   projects: '++id, name, type',
    //   prompts: '++id, timestamp, promptType',
    //   settings: '++id, name',
    //   tags: '++id, name'
    // })
  }
}

// Early versions of ArtBot saved a single `model` string and no `source_image`.
// Rows are upgraded as they're read, so stored images are never rewritten.
const normalizeCompletedRow = (row: any) => {
  if (!row) return row
  if (Array.isArray(row.models) && row.source_image !== undefined) {
    return row
  }

  return {
    ...row,
    models: Array.isArray(row.models)
      ? row.models
      : [row.model || 'stable_diffusion'],
    source_image: row.source_image ?? ''
  }
}

const applicationDatabase = (name?: string) => {
  const database = new MySubClassedDexie(name)
  database.completed.hook('reading', normalizeCompletedRow)
  for (const table of database.tables) {
    table.hook('creating', () => assertLibraryWritable(database.name))
    table.hook('updating', () => assertLibraryWritable(database.name))
    table.hook('deleting', () => assertLibraryWritable(database.name))
  }
  return database
}
export let db = applicationDatabase()
export function refreshSelectedDatabase() {
  const name = selection()?.name || 'imageHorde'
  if (db.name !== name) {
    db.close()
    db = applicationDatabase(name)
  }
  if (typeof window !== 'undefined') (window as any)._artbotDb = db
}

declare const window: any
if (typeof window !== 'undefined' && !window._artbotDb) {
  window._artbotDb = db
}
if (typeof window !== 'undefined')
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key !== SELECTION_KEY) return
    const previous = event.oldValue ? JSON.parse(event.oldValue) : undefined
    const current = event.newValue ? JSON.parse(event.newValue) : undefined
    if (
      previous?.name !== current?.name ||
      previous?.generation !== current?.generation
    ) {
      db.close()
      const reopen = () =>
        backupBusy() ? setTimeout(reopen, 200) : window.location.reload()
      reopen()
    }
  })
