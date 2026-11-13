export const UNREADABLE_BACKUP_MESSAGE =
  'A selected backup file could not be read. Choose the saved files again. If this continues, close and reopen ArtBot, then select the copies saved in Files'

export const EMPTY_BACKUP_MESSAGE =
  'A selected backup file is empty or unavailable. Choose the saved files again. If this continues, close and reopen ArtBot, then select the copies saved in Files'

// A native picker can deliver a named, zero-byte File for a healthy document.
// Reject that selection before staging records or recording verification. Empty
// binary fields inside a valid backup remain supported by the record codec.
export function assertBackupFilesAvailable(files: readonly Blob[]) {
  const empty = files.find((file) => file.size === 0)
  if (empty)
    throw new Error(
      EMPTY_BACKUP_MESSAGE +
        ' File: ' +
        ((empty as File).name || 'unnamed file')
    )
}

export function backupErrorMessage(error: unknown) {
  const value = error as Error
  return ['NotFoundError', 'NotReadableError'].includes(value?.name)
    ? UNREADABLE_BACKUP_MESSAGE
    : value?.message || String(error)
}
