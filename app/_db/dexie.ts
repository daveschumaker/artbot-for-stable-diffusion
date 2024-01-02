import Dexie from 'dexie'

export class MySubClassedDexie extends Dexie {
  completed: any
  images: any
  pending: any
  prompts: any
  settings: any

  favorites: any
  models: any
  image_details: any
  image_files: any
  image_status: any
  image_type: any

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

    this.version(7).stores({
      completed: '++id, jobId, timestamp, parentJobId',
      images: '++id, imageType, parentJobId, jobId, type',
      imageProjects: '++id, projectId, imageId',
      imageTags: '++id, tagId, imageId',
      pending: '++id, jobId, timestamp, parentJobId, jobStatus',
      projects: '++id, name, type',
      prompts: '++id, timestamp, promptType',
      settings: '++id, name',
      tags: '++id, name',

      // New v2 tables:
      favorites: 'jobId', // Keep track of favorites. 1 favorite per jobId
      models: 'jobId, model', // Keep track of image models for later lookups. 1 model per jobId
      image_details: 'jobId, generationId',
      image_files: 'jobId', // Store base64string or blob
      image_status: 'jobId, status', // Pending, completed, error, 1 per jobId
      image_type: 'jobId, type' // text2img, img2img, controlNet?
    })
  }
}

export const db = new MySubClassedDexie()

declare const window: any
if (typeof window !== 'undefined' && !window._artbotDb) {
  window._artbotDb = db
}
