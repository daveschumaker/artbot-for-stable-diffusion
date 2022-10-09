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
  }
}

export const db = new MySubClassedDexie()

export const allPendingJobs = async () => {
  return await db?.pending?.orderBy('timestamp').toArray()
}

export const fetchCompletedJobs = async () => {
  return await db?.completed?.orderBy('timestamp').reverse().toArray()
}

export const getPendingJobDetails = async (jobId: string) => {
  return await db.pending
    .filter(function (job: { jobId: string }) {
      return job.jobId === jobId
    })
    .first()
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

export const deletePendingJob = async (jobId: string) => {
  await db.pending
    .filter(function (job: { jobId: string }) {
      return job.jobId === jobId
    })
    .delete()
}

export const initDb = () => {
  // console.log(`Database loaded`)
}
