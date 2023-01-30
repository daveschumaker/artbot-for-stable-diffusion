import ImageJobs from '../models/ImageJobs'
import { fetchCompletedJobsById } from '../utils/db'

let completedJobsV2: Array<any> = []
let completedJobIds: Array<string> = []

const updateJobDetails = async () => {
  // @ts-ignore
  const updatedJobs = await fetchCompletedJobsById({ ids: completedJobIds })

  const sortedJobs = updatedJobs.sort((a: any, b: any) => {
    if (a.timestamp > b.timestamp) {
      return 1
    }
    if (a.timestamp < b.timestamp) {
      return -1
    }

    return 0
  })

  completedJobsV2 = [...sortedJobs]
  ImageJobs.set('completed', [...completedJobIds])
}

export const initRecentJobs = async () => {
  if (Array.isArray(ImageJobs.get('completed'))) {
    completedJobIds = [...ImageJobs.get('completed')]
    await updateJobDetails()
  } else {
    completedJobIds = []
  }
}

export const setCompletedJob = async (jobDetails: { jobId: string }) => {
  const exists = completedJobIds.indexOf(jobDetails.jobId) >= 0

  if (!exists) {
    completedJobIds.push(jobDetails.jobId)
    updateJobDetails()
  }
}

export const getCompletedJobs = () => {
  return [...completedJobsV2]
}

export const clearCompletedJob = async (jobId: string) => {
  completedJobIds = completedJobIds.filter((id) => {
    return id !== jobId
  })

  await updateJobDetails()
}

export const resetCompleted = () => {
  completedJobsV2 = []
  completedJobIds = []
  ImageJobs.set('completed', [])
}
