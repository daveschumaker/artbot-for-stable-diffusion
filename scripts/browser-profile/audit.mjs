// Runs on a script-free page at the production origin, using native IndexedDB.
// Never opens ArtBot/Dexie, so inspecting a legacy database cannot upgrade it.
export async function auditStorage(page, { recordDigests = false } = {}) {
  const audit = async ({ recordDigests }) => {
    const digest = async (bytes) =>
      Array.from(
        new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)),
        (n) => n.toString(16).padStart(2, '0')
      ).join('')
    const hash = (value) =>
      digest(new TextEncoder().encode(JSON.stringify(value)))
    const request = (req) =>
      new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      })
    const databases = []
    for (const info of (await indexedDB.databases()).sort((a, b) =>
      a.name.localeCompare(b.name)
    )) {
      const db = await request(indexedDB.open(info.name))
      try {
        const stores = []
        for (const name of db.objectStoreNames) {
          const schema = db.transaction(name).objectStore(name)
          const entry = {
            name,
            keyPath: schema.keyPath,
            autoIncrement: schema.autoIncrement,
            indexes: Array.from(schema.indexNames, (indexName) => {
              const i = schema.index(indexName)
              return {
                name: i.name,
                keyPath: i.keyPath,
                unique: i.unique,
                multiEntry: i.multiEntry
              }
            }),
            rows: 0,
            blobs: 0,
            blobBytes: 0,
            binaryValues: 0
          }
          // Explicit type tags, reference IDs, and byte hashes avoid JSON's
          // silent conversion of Blobs, typed arrays, dates, and cyclic values.
          async function encode(value, seen = new Map()) {
            if (value === null) return ['null']
            if (typeof value !== 'object')
              return [typeof value, Object.is(value, -0) ? '-0' : String(value)]
            if (seen.has(value)) return ['ref', seen.get(value)]
            seen.set(value, seen.size)
            if (value instanceof Blob) {
              entry.blobs++
              entry.blobBytes += value.size
              return [
                'blob',
                value.type,
                value.size,
                value instanceof File ? [value.name, value.lastModified] : null,
                await digest(await value.arrayBuffer())
              ]
            }
            if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
              entry.binaryValues++
              const bytes =
                value instanceof ArrayBuffer
                  ? value
                  : new Uint8Array(
                      value.buffer,
                      value.byteOffset,
                      value.byteLength
                    )
              return [value.constructor.name, await digest(bytes)]
            }
            if (value instanceof Date) return ['date', value.toISOString()]
            if (value instanceof RegExp)
              return ['regexp', value.source, value.flags]
            if (value instanceof Map) {
              const pairs = []
              for (const [k, v] of value)
                pairs.push([await encode(k, seen), await encode(v, seen)])
              return ['map', pairs]
            }
            if (value instanceof Set) {
              const items = []
              for (const v of value) items.push(await encode(v, seen))
              return ['set', items]
            }
            if (
              !Array.isArray(value) &&
              Object.getPrototypeOf(value) !== Object.prototype
            ) {
              throw new Error(
                `Unsupported audit type: ${value.constructor?.name}; refusing an incomplete hash`
              )
            }
            const fields = []
            for (const key of Object.keys(value).sort())
              fields.push([key, await encode(value[key], seen)])
            return [
              Array.isArray(value) ? 'array' : 'object',
              Array.isArray(value) ? value.length : null,
              fields
            ]
          }
          let lastKey
          let chain = ''
          const records = []
          const workflows = new Map()
          const batchGroups = new Map()
          while (true) {
            // One record per transaction bounds memory to the largest record.
            // Blob hashing happens after reading, without holding a transaction.
            const store = db.transaction(name).objectStore(name)
            const range =
              lastKey === undefined
                ? undefined
                : IDBKeyRange.lowerBound(lastKey, true)
            const cursor = await request(store.openCursor(range))
            if (!cursor) break
            lastKey = cursor.key
            const row = cursor.value
            if (name === 'completed' || name === 'pending') {
              const groupId = row.parentJobId || row.jobId || String(cursor.key)
              const group = batchGroups.get(groupId) ?? {
                parentJobId: row.parentJobId ?? null,
                jobIds: [],
                requestedImages: [],
                promptHashes: []
              }
              group.jobIds.push(row.jobId ?? null)
              if (!group.requestedImages.includes(row.numImages ?? null))
                group.requestedImages.push(row.numImages ?? null)
              const promptHash = await hash(row.prompt ?? '')
              if (!group.promptHashes.includes(promptHash))
                group.promptHashes.push(promptHash)
              batchGroups.set(groupId, group)
              let outputSize = null
              if (row.base64String) {
                try {
                  const base64 = row.base64String.replace(/^data:[^,]+,/, '')
                  const bytes = Uint8Array.from(atob(base64), (c) =>
                    c.charCodeAt(0)
                  )
                  const bitmap = await createImageBitmap(new Blob([bytes]))
                  outputSize = [bitmap.width, bitmap.height]
                  bitmap.close()
                } catch {
                  outputSize = 'decode-error'
                }
              }
              const parameters = {
                models: row.models ?? [row.model ?? 'unknown'],
                requestedImages: row.numImages ?? null,
                processing: row.source_processing ?? 'prompt',
                control: row.control_type || null,
                tiling: !!row.tiling,
                postProcessing: row.post_processing ?? [],
                hasSource: !!row.source_image,
                hasMask: !!row.source_mask,
                hasCanvas: !!row.canvasData,
                requestedSize: [row.width, row.height],
                outputSize,
                status: row.jobStatus ?? null
              }
              const key = JSON.stringify(parameters)
              workflows.set(key, {
                ...parameters,
                count: (workflows.get(key)?.count ?? 0) + 1
              })
            }
            const encodedKey = await encode(cursor.key)
            const encodedValue = await encode(cursor.value)
            chain = await hash([chain, encodedKey, encodedValue])
            if (recordDigests)
              records.push({
                keySha256: await hash(encodedKey),
                sha256: await hash(encodedValue)
              })
            entry.rows++
          }
          stores.push({
            ...entry,
            sha256: chain || (await hash([])),
            ...(recordDigests ? { recordDigests: records } : {}),
            ...(workflows.size ? { workflows: [...workflows.values()] } : {}),
            ...(batchGroups.size
              ? {
                  batchGroups: [...batchGroups.values()].map((group) => ({
                    ...group,
                    rows: group.jobIds.length,
                    uniqueJobs: new Set(group.jobIds).size
                  }))
                }
              : {})
          })
        }
        databases.push({ name: db.name, version: db.version, stores })
      } finally {
        db.close()
      }
    }
    const storage = Object.keys(localStorage)
      .sort()
      .map((key) => [key, localStorage.getItem(key)])
    return {
      origin: location.origin,
      databases,
      localStorage: {
        keys: storage.length,
        sha256: await hash(storage),
        ...(recordDigests
          ? {
              entries: await Promise.all(
                storage.map(async ([key, value]) => ({
                  key,
                  sha256: await hash(value)
                }))
              )
            }
          : {})
      },
      cacheNames: (await caches.keys()).sort(),
      serviceWorkers: (await navigator.serviceWorker.getRegistrations()).map(
        (r) => ({ scope: r.scope, scriptURL: r.active?.scriptURL ?? null })
      )
    }
  }
  return page.evaluate(audit, { recordDigests })
}
