import Dexie, { Table } from 'dexie'

export interface Friend {
  id?: number
  name: string
  age: number
}

export class MySubClassedDexie extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  friends!: Table<Friend>
  completed: any
  pending: any

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
  }
}

export const db = new MySubClassedDexie()

export const allPendingJobs = async () => {
  return await db?.pending?.orderBy('timestamp').toArray()
}

export const bulkDeleteImages = async (images: Array<string>) => {
  return db.completed.bulkDelete(images)
}

export const getAllPendingJobsByStatus = async (
  status: string,
  limit: number = 5
) => {
  return await db.pending
    .orderBy('timestamp')
    .limit(limit)
    .filter(function (job: { jobStatus: string }) {
      return job.jobStatus === status
    })
    .toArray()
}

export const countCompletedJobs = async () => {
  return await db?.completed?.orderBy('timestamp').count()
}

export const fetchCompletedJobs = async ({
  limit = 100,
  offset = 0,
  sort = 'new'
} = {}) => {
  if (sort === 'old') {
    return await db?.completed
      ?.orderBy('timestamp')
      .offset(offset)
      .limit(limit)
      .toArray()
  } else {
    return await db?.completed
      ?.orderBy('timestamp')
      .reverse()
      .offset(offset)
      .limit(limit)
      .toArray()
  }
}

export const fetchRelatedImages = async (
  parentJobId: string,
  limit?: number
) => {
  if (!limit) {
    limit = Infinity
  }
  return await db?.completed
    ?.where({ parentJobId })
    .limit(limit)
    .reverse()
    .toArray()
}

export const getPendingJobDetails = async (jobId: string) => {
  return await db.pending
    .filter(function (job: { jobId: string }) {
      return job.jobId === jobId
    })
    .first()
}

// @ts-ignore
export const updatePendingJob = async (tableId: number, updatedObject) => {
  db.pending.update(tableId, updatedObject)
}

export const getImageDetails = async (jobId: string) => {
  return await db.completed
    .filter(function (job: { jobId: string }) {
      return job.jobId === jobId
    })
    .first()
}

export const deleteCompletedImage = async (jobId: string) => {
  await db.completed
    .filter(function (job: { jobId: string }) {
      return job.jobId === jobId
    })
    .delete()
}

export const deletePendingJobFromDb = async (jobId: string) => {
  await db.pending
    .filter(function (job: { jobId: string }) {
      return job.jobId === jobId
    })
    .delete()
}

export const imageCount = async () => {
  return await db.completed.count()
}

export const pendingCount = async () => {
  return await db.pending.count()
}

export const initDb = () => {
  // console.log(`Database loaded`)
}
