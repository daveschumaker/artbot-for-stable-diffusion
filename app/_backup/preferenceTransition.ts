import Dexie from 'dexie'
import {
  PERSISTENT_KEYS,
  Selection,
  selection,
  readPreferences,
  readLocalPreferences
} from './platform'

interface Preferences {
  appConfig: Record<string, unknown>
  localPreferences: Record<string, string>
}
interface Transition {
  before: Selection | null
  after: Selection
  catalog: string
  beforeSnapshot: string
  afterSnapshot: string
}
const transitionKey = (key: string) => `${key}:transition`
const metadata = (value: Selection): Selection => {
  const result = { ...value }
  delete result.appConfig
  delete result.localPreferences
  return result
}

function apply(storage: Storage, preferences: Preferences) {
  // The durable journal can recover any interruption between these small writes.
  // Release the old values first so a valid large preference fits only once.
  storage.removeItem('appConfig')
  for (const key of PERSISTENT_KEYS) storage.removeItem(key)
  storage.setItem('appConfig', JSON.stringify(preferences.appConfig))
  for (const key of PERSISTENT_KEYS) {
    const value = preferences.localPreferences[key]
    if (value !== undefined) storage.setItem(key, value)
  }
}
async function cleanup(
  catalog: Dexie,
  storage: Storage,
  key: string,
  journal: Transition
) {
  // Once the journal is removed, settings and selection agree durably. Failure
  // to prune temporary snapshots must not turn a committed restore into failure.
  try {
    storage.removeItem(transitionKey(key))
  } catch {
    return
  }
  await catalog
    .table('preferences')
    .bulkDelete([journal.beforeSnapshot, journal.afterSnapshot])
    .catch(() => {})
}
export async function transitionPreferences(
  catalog: Dexie,
  storage: Storage,
  key: string,
  after: Selection,
  fence: () => Promise<void>
) {
  const before = selection(storage, key) || null
  const original: Preferences = {
    appConfig: readPreferences(storage, key),
    localPreferences: readLocalPreferences(storage, key)
  }
  const target: Preferences = {
    appConfig: after.appConfig || {},
    localPreferences: after.localPreferences || {}
  }
  const journal: Transition = {
    before: before && metadata(before),
    after: metadata(after),
    catalog: catalog.name,
    beforeSnapshot: crypto.randomUUID(),
    afterSnapshot: crypto.randomUUID()
  }
  await catalog.table('preferences').bulkAdd([
    { id: journal.beforeSnapshot, value: original },
    { id: journal.afterSnapshot, value: target }
  ])
  try {
    await fence()
    storage.setItem(transitionKey(key), JSON.stringify(journal))
  } catch (error) {
    // Nothing was changed if publication of the recovery journal failed.
    // Do not accumulate large orphan snapshots on repeated quota failures.
    if (!storage.getItem(transitionKey(key)))
      await catalog
        .table('preferences')
        .bulkDelete([journal.beforeSnapshot, journal.afterSnapshot])
        .catch(() => {})
    throw error
  }
  try {
    apply(storage, target)
    storage.setItem(key, JSON.stringify(journal.after))
  } catch (error) {
    // Selection was not published. Leave the journal if rollback itself fails;
    // the startup gate will repair the original preferences before opening UI.
    try {
      apply(storage, original)
      await cleanup(catalog, storage, key, journal)
    } catch {
      /* retain the recovery journal */
    }
    throw error
  }
  await cleanup(catalog, storage, key, journal)
}
export async function recoverPreferenceTransition(
  storage: Storage,
  key: string
) {
  const encoded = storage.getItem(transitionKey(key))
  if (!encoded) return
  const journal: Transition = JSON.parse(encoded)
  const current = selection(storage, key)
  const same = (
    a: Selection | null | undefined,
    b: Selection | null | undefined
  ) =>
    (a?.name || null) === (b?.name || null) &&
    (a?.generation || null) === (b?.generation || null)
  const committed = same(current, journal.after)
  if (!committed && !same(current, journal.before))
    throw new Error('Library selection changed during preference recovery')
  const catalog = new Dexie(journal.catalog)
  try {
    await catalog.open()
    const snapshot = await catalog
      .table('preferences')
      .get(committed ? journal.afterSnapshot : journal.beforeSnapshot)
    if (!snapshot?.value?.appConfig || !snapshot.value.localPreferences)
      throw new Error('Library preference recovery snapshot is unavailable')
    apply(storage, snapshot.value)
    await cleanup(catalog, storage, key, journal)
    if (storage.getItem(transitionKey(key)))
      throw new Error('Unable to finish library preference recovery')
  } finally {
    catalog.close()
  }
}
