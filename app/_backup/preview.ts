import { readBackupManifest, checkCancelled } from './format'
import { storageStatus, restoreSpaceRequired } from './storage'
import { assertBackupFilesAvailable } from './errors'

export interface RestorePreview {
  format: 'multipart' | 'legacy'
  createdAt?: string
  images?: number
  records?: number
  parts: number
  selectedParts: number
  credentials: boolean
  missing: string[]
  issues: string[]
  required: number
  available?: number
}

// Inventory only. Content hashes, record graphs and preferences are independently
// checked by restore before activation. Never parse a whole legacy archive here.
export async function previewBackup(
  files: File[],
  signal?: AbortSignal
): Promise<RestorePreview> {
  checkCancelled(signal)
  assertBackupFilesAvailable(files)
  const manifests = files.filter((file) => file.name.endsWith('.manifest.json'))
  const bytes = files.reduce((total, file) => total + file.size, 0)
  const status = await storageStatus()
  const result: RestorePreview = {
    format: manifests.length ? 'multipart' : 'legacy',
    parts: 0,
    selectedParts: 0,
    credentials: false,
    missing: [],
    issues: [],
    required: restoreSpaceRequired(bytes),
    available:
      status.usage !== undefined && status.quota !== undefined
        ? Math.max(0, status.quota - status.usage)
        : undefined
  }
  if (manifests.length) {
    if (manifests.length !== 1)
      throw new Error('Select one complete backup manifest and all its parts')
    const manifest = await readBackupManifest(manifests[0], signal)
    const named = new Map(files.map((file) => [file.name, file]))
    const expected = new Set([
      manifests[0].name,
      ...manifest.parts.map((part) => part.name)
    ])
    result.createdAt = manifest.createdAt
    result.images =
      manifest.tables.find((table) => table.name === 'completed')?.count || 0
    result.records = manifest.records
    result.credentials = manifest.credentialsIncluded === true
    result.parts = manifest.parts.length
    result.missing = manifest.parts
      .filter((part) => !named.has(part.name))
      .map((part) => part.name)
    result.selectedParts = result.parts - result.missing.length
    result.required = restoreSpaceRequired(
      manifests[0].size +
        manifest.parts.reduce((sum, part) => sum + part.size, 0)
    )
    if (
      named.size !== files.length ||
      files.some((file) => !expected.has(file.name)) ||
      result.missing.length
    )
      result.issues.push(
        'Missing, duplicate or unexpected backup files. Choose the manifest and every listed part.'
      )
    for (const [index, part] of manifest.parts.entries())
      if (
        named.has(part.name) &&
        (named.get(part.name)!.size !== part.size ||
          part.index !== index ||
          part.size > manifest.maxPartBytes)
      )
        result.issues.push(
          'Missing or damaged backup part ' +
            (index + 1) +
            ': the file size does not match.'
        )
  } else {
    if (files.some((file) => file.name.endsWith('.artbot-part')))
      throw new Error(
        'Select the backup manifest and every listed part before restoring'
      )
    if (files.length !== 1)
      throw new Error(
        'Select one legacy recovery file, or a backup manifest and all its parts'
      )
    // Legacy JSON may start with arbitrarily long whitespace. Its contents
    // are streamed and validated by restore, not sampled or parsed here.
  }
  if (result.available !== undefined && result.available < result.required)
    result.issues.push(
      'Not enough estimated storage. Free device space before restoring. Your current library is unchanged.'
    )
  checkCancelled(signal)
  return result
}
