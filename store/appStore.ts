import { makeStore } from 'statery'

interface AppStore {
  buildId: string
  showImageReadyToast: boolean
  newImageReady: string
  indexDbSupport: boolean
}

export const appInfoStore = makeStore<AppStore>({
  buildId: '',
  showImageReadyToast: false,
  newImageReady: '',
  indexDbSupport: true
})

export const setBuildId = (id: string) => {
  appInfoStore.set(() => ({
    buildId: id
  }))
}

export const setIndexDbSupport = (bool: boolean) => {
  appInfoStore.set(() => ({
    indexDbSupport: bool
  }))
}

export const setShowImageReadyToast = (bool: boolean) => {
  appInfoStore.set(() => ({
    showImageReadyToast: bool
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
