import { makeStore } from 'statery'

export const imageStore = makeStore({
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
