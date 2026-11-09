import Dexie from 'dexie'

export class MySubClassedDexie extends Dexie {
  completed: any
  images: any
  pending: any
  prompts: any
  settings: any

  constructor() {
    super('imageHorde')
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

    this.version(6).stores({
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
export const normalizeCompletedRow = (row: any) => {
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

export const db = new MySubClassedDexie()
db.completed.hook('reading', normalizeCompletedRow)

declare const window: any
if (typeof window !== 'undefined' && !window._artbotDb) {
  window._artbotDb = db
}
