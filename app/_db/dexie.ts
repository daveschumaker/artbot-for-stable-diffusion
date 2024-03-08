import { FavoriteImage } from 'app/_data-models/dexie/FavoriteImage'
import { HordeJob } from 'app/_data-models/dexie/HordeJob'
import { ImageFile } from 'app/_data-models/dexie/ImageFile'
import { JobRequestDetails } from 'app/_data-models/dexie/JobRequestDetails'
import Dexie from 'dexie'

export class MySubClassedDexie extends Dexie {
  completed: any
  images: any
  pending: any
  prompts: any
  settings: any

  ///////////// NEW TABLE WORK:
  favoriteImages!: Dexie.Table<FavoriteImage, number>
  hordeJobs!: Dexie.Table<HordeJob, number>
  imageFiles!: Dexie.Table<ImageFile, number>
  jobRequestDetails!: Dexie.Table<JobRequestDetails, number>

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
      completed_v2: '++id, jobId, timestamp, parentJobId', // Create new table as we don't want to overwrite existing data until we can migrate.
      image_details: '++id, jobId, generationId',
      image_status: '++id, jobId, status', // Pending, completed, error, 1 per jobId
      image_type: '++id, jobId, type', // text2img, img2img, controlNet?
      job_relationships: '++id, jobId, relatedJobId, relationship', // Keep track of related jobs (e.g., parent jobs, related jobs, etc).

      /////////// V2 STUFF
      favoriteImages: '++id, jobId, imageId',
      hordeJobs: '++id, jobId, timestamp, jobType, jobStatus, promptSearch',
      imageFiles: '++id, jobId, imageId, imageType, imageStatus, model',
      jobRequestDetails: '++id, jobId'
    })

    /////////// V2 STUFF
    this.favoriteImages.mapToClass(FavoriteImage)
    this.hordeJobs.mapToClass(HordeJob)
    this.imageFiles.mapToClass(ImageFile)
    this.jobRequestDetails.mapToClass(JobRequestDetails)
  }
}

export const db = new MySubClassedDexie()

declare const window: any
if (typeof window !== 'undefined' && !window._artbotDb) {
  window._artbotDb = db
}
