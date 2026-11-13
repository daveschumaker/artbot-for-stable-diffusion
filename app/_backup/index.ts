import { BackupManager } from './manager'
import { browserStorage } from './platform'
import { appInfoStore } from 'app/_store/appStore'
export type {
  BackupHandoff,
  BackupInventory,
  Progress,
  PrepareOptions,
  RestoreOptions,
  RestoreReport
} from './manager'
export type { Manifest } from './format'
export { storageStatus, requestPersistence, withScreenAwake } from './storage'
let instance: BackupManager | undefined
export function appBackup() {
  const storage = browserStorage()
  if (!storage) throw new Error('Browser storage is unavailable')
  instance ??= new BackupManager({
    storage,
    getBuild: () => appInfoStore.state.buildId || 'unknown'
  })
  return instance
}

export { previewBackup } from './preview'
export type { RestorePreview } from './preview'
