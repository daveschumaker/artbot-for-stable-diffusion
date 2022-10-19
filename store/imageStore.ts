import { makeStore } from 'statery'

interface ImageDetailsStore {
  pendingJobs: number
}
interface JobDetails {
  processing: boolean
  jobStartTimestamp: number
  initialTimeRemaining: number
}

export const imageStore = makeStore<ImageDetailsStore>({
  pendingJobs: 0,
  processing: false,
  initialTimeRemaining: 0,
  timeRemaining: 0,
  timeElapsed: 0
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
