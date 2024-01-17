import {
  initLoadPendingJobsFromDb,
  syncPendingJobsFromDb,
  deletePendingJobs,
  deletePendingJob,
  getPendingJob,
  getAllPendingJobs,
  setPendingJob,
  updatePendingJobV2,
  updatePendingJobProperties,
  updatePendingJobId,
  updateAllPendingJobsV2
} from './pendingJobsCache'
import { allPendingJobs, deletePendingJobFromDb } from 'app/_utils/db'
import { JobStatus } from '_types'

jest.mock('app/_utils/db', () => ({
  allPendingJobs: jest.fn(),
  deletePendingJobFromDb: jest.fn(),
  updatePendingJobInDexie: jest.fn()
}))

const mockJob = {
  id: 1,
  jobId: '123',
  jobStatus: JobStatus.Waiting
}

describe('Pending Jobs Tests', () => {
  beforeEach(() => {
    ;(allPendingJobs as jest.Mock).mockClear()
    ;(deletePendingJobFromDb as jest.Mock).mockClear()
  })

  it('initializes pending jobs from DB', async () => {
    ;(allPendingJobs as jest.Mock).mockResolvedValue([mockJob])
    await initLoadPendingJobsFromDb()
    expect(getPendingJob('123')).toEqual(mockJob)
  })

  it('syncs pending jobs from DB', async () => {
    ;(allPendingJobs as jest.Mock).mockResolvedValue([mockJob])
    await syncPendingJobsFromDb()
    expect(getPendingJob('123')).toEqual(mockJob)
  })

  it('deletes a specific pending job', async () => {
    setPendingJob(mockJob)
    await deletePendingJob('123')
    expect(getPendingJob('123')).toBeUndefined()
  })

  it('deletes all pending jobs with a specific status', async () => {
    setPendingJob({ ...mockJob, jobStatus: JobStatus.Processing })
    await deletePendingJobs(JobStatus.Processing)
    expect(getAllPendingJobs()).toEqual([])
  })

  it('sets a new pending job', () => {
    setPendingJob(mockJob)
    expect(getPendingJob('123')).toEqual(mockJob)
  })

  it('updates a pending job', () => {
    setPendingJob(mockJob)
    const updatedJob = { ...mockJob, jobStatus: JobStatus.Processing }
    updatePendingJobV2(updatedJob)
    expect(getPendingJob('123')).toEqual(updatedJob)
  })

  it('updates pending job properties', () => {
    setPendingJob(mockJob)
    updatePendingJobProperties('123', { jobStatus: JobStatus.Processing })
    expect(getPendingJob('123')?.jobStatus).toBe(JobStatus.Processing)
  })

  it('updates pending job ID', () => {
    setPendingJob(mockJob)
    updatePendingJobId('123', '456')
    expect(getPendingJob('123')).toBeUndefined()
    expect(getPendingJob('456')).toEqual({ ...mockJob, jobId: '456' })
  })

  it('updates all pending jobs based on a status', () => {
    setPendingJob(mockJob)
    updateAllPendingJobsV2(JobStatus.Processing, {
      errorMessage: 'Error occurred'
    })
    expect(getPendingJob('123')?.jobStatus).toBe(JobStatus.Processing)
    expect(getPendingJob('123')?.errorMessage).toBe('Error occurred')
  })
})
