import { makeStore } from 'statery'

export const appInfoStore = makeStore({
  buildId: '',
  newImageReady: ''
})

export const setBuildId = (id: string) => {
  appInfoStore.set(() => ({
    buildId: id
  }))
}

export const setNewImageReady = (jobId: string) => {
  appInfoStore.set(() => ({
    newImageReady: jobId
  }))
}
