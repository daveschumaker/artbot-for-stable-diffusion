import ImageModel from 'app/_data-models/v2/ImageModel'
import Dexie from 'dexie'

class Favorite {
  jobId!: string
  imageId!: string
}

export class MySubClassedDexie extends Dexie {
  completed: any
  images: any
  pending: any
  prompts: any
  settings: any

  favorites!: Dexie.Table<Favorite, number>
  image_files!: Dexie.Table<ImageModel, number>

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

      // Tables that are READY
      image_files: '++id, jobId, hordeId, model, type', // Stores blob

      // New v2 tables:
      favorites: '++id, jobId, imageId', // Keep track of favorites. 1 favorite per imageId
      image_details: '++id, jobId, generationId',
      image_status: '++id, jobId, status', // Pending, completed, error, 1 per jobId
      image_type: '++id, jobId, type' // text2img, img2img, controlNet?
    })

    this.favorites.mapToClass(Favorite)
    this.image_files.mapToClass(ImageModel)
  }
}

export const db = new MySubClassedDexie()

declare const window: any
if (typeof window !== 'undefined' && !window._artbotDb) {
  window._artbotDb = db
}
