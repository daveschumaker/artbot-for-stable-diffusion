import { makeStore } from 'statery'

export const appInfoStore = makeStore({
  buildId: '',
  showImageReadyToast: false,
  newImageReady: ''
})

export const setBuildId = (id: string) => {
  appInfoStore.set(() => ({
    buildId: id
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
