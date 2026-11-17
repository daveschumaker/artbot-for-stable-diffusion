export const restoreSpaceRequired = (bytes: number) =>
  bytes * 1.5 + 32 * 1024 * 1024
/* global StorageEstimate */
export async function storageStatus() {
  const supported = typeof navigator !== 'undefined' && !!navigator.storage
  const estimate =
    supported && navigator.storage.estimate
      ? await navigator.storage.estimate().catch(() => ({}) as StorageEstimate)
      : {}
  const persisted =
    supported && navigator.storage.persisted
      ? await navigator.storage.persisted().catch(() => false)
      : false
  return {
    usage: estimate.usage,
    quota: estimate.quota,
    persisted,
    canPersist: supported && !!navigator.storage.persist
  }
}
export async function requestPersistence() {
  return typeof navigator !== 'undefined' && navigator.storage?.persist
    ? navigator.storage.persist()
    : false
}
export async function assertHeadroom(required: number) {
  const { usage, quota } = await storageStatus()
  if (quota !== undefined && usage !== undefined && quota - usage < required)
    throw new Error(
      'Not enough estimated storage for a safe backup or restore. Remove incomplete preparations or free device space, then retry. Your current library is unchanged.'
    )
}
export async function withScreenAwake<T>(action: () => Promise<T>) {
  let lock: WakeLockSentinel | undefined
  try {
    if (typeof navigator !== 'undefined' && navigator.wakeLock)
      lock = await navigator.wakeLock.request('screen')
  } catch {
    /* Visible guidance remains necessary when denied. */
  }
  try {
    return await action()
  } finally {
    await lock?.release().catch(() => {})
  }
}
