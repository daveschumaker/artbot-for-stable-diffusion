import { makeStore } from 'statery'

interface ImageDetailsStore {
  pendingJobs: number
  currentJobs: CurrentJobs
}

interface CurrentJobs {
  [key: string]: JobDetails
}
interface JobDetails {
  processing: boolean
  jobStartTimestamp: number
  initialTimeRemaining: number
}

export const imageStore = makeStore<ImageDetailsStore>({
  pendingJobs: 0,
  currentJobs: {}
})
