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

// export const setBuildId = (id: string) => {
//   appInfoStore.set(() => ({
//     buildId: id
//   }))
// }

// export const setNewImageReady = (bool: boolean) => {
//   appInfoStore.set(() => ({
//     newImageReady: bool
//   }))
// }
