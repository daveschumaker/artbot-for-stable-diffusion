let completedJobs: Array<any> = []

export const setCompletedJob = (jobDetails: any) => {
  let exists = completedJobs.find((o) => o.id === jobDetails.id)

  if (!exists) {
    completedJobs.push(jobDetails)
  }
}

export const getCompletedJobs = () => {
  return [...completedJobs]
}

export const clearCompletedJob = (jobId: string) => {
  completedJobs = completedJobs.filter((job) => {
    return job.jobId !== jobId
  })
}

export const resetCompleted = () => {
  completedJobs = []
}
