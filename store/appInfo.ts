import { makeStore } from 'statery'

export const appInfoStore = makeStore({
  buildId: '',
  newImageReady: false
})

export const setBuildId = (id: string) => {
  appInfoStore.set(() => ({
    buildId: id
  }))
}

export const setNewImageReady = (bool: boolean) => {
  appInfoStore.set(() => ({
    newImageReady: bool
  }))
}
