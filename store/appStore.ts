import { makeStore } from 'statery'

interface AppStore {
  buildId: string
  trusted: boolean
  showImageReadyToast: boolean
  newImageReady: string
  models: Array<string>
}

export const appInfoStore = makeStore<AppStore>({
  buildId: '',
  trusted: false,
  showImageReadyToast: false,
  newImageReady: '',
  models: ['stable_diffusion']
})

export const setBuildId = (id: string) => {
  appInfoStore.set(() => ({
    buildId: id
  }))
}

export const setTrustedUser = (bool: boolean) => {
  appInfoStore.set(() => ({
    trusted: bool
  }))
}

export const setShowImageReadyToast = (bool: boolean) => {
  appInfoStore.set(() => ({
    showImageReadyToast: bool
  }))
}

export const setAvailableModels = (arr: Array<string>) => {
  appInfoStore.set(() => ({
    models: arr
  }))
}

export const setNewImageReady = (jobId: string) => {
  // Attempt to prevent race condition when PendingItems component
  // tries to update the toast. For some reason, it's not
  // getting the correct state.

  if (jobId && appInfoStore.state.showImageReadyToast) {
    return
  }

  appInfoStore.set(() => ({
    newImageReady: jobId,
    showImageReadyToast: jobId ? true : false
  }))
}