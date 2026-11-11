import clarinet from 'clarinet'
import type { JsonStream } from 'dexie-export-import/dist/json-stream'
import type { DexieExportJsonStructure } from 'dexie-export-import/dist/json-structure'

// The export format stores whole base64 image strings. One stored record is
// the minimum memory unit; the parser must not impose a 64 KiB string limit.
Object.assign(clarinet, { MAX_BUFFER_LENGTH: Infinity })

/** Dexie's public JsonStream interface, with backpressure before each read.
 * Containers have the same temporary `incomplete` marker expected by its
 * streaming importer; consumed rows are released by importInto().
 */
export function legacyImportStream(
  file: Blob,
  drain: () => Promise<void>,
  signal?: AbortSignal
): JsonStream<DexieExportJsonStructure> {
  const parser = clarinet.parser()
  const decoder = new TextDecoder('utf-8', { fatal: true })
  let position = 0,
    complete = false
  const stack: { value: any; key?: string }[] = []
  const stream: JsonStream<DexieExportJsonStructure> = {
    result: {},
    done: () => complete,
    eof: () => position >= file.size,
    pullSync: () => {
      throw new Error('Legacy restore requires asynchronous reads')
    },
    pullAsync: async (bytes) => {
      // The previous chunk's synchronous filter may have launched async hashes.
      // Await and release those rows BEFORE reading or parsing another chunk.
      await drain()
      if (signal?.aborted)
        throw new DOMException('Restore paused', 'AbortError')
      const end = Math.min(file.size, position + Math.min(bytes, 256 * 1024))
      const buffer = await file.slice(position, end).arrayBuffer()
      position = end
      parser.write(decoder.decode(buffer, { stream: end < file.size }))
      if (end === file.size) parser.close()
      return stream.result
    }
  }
  const attach = (value: unknown) => {
    const parent = stack[stack.length - 1]
    if (!parent) {
      stream.result = value as DexieExportJsonStructure
      return
    }
    if (Array.isArray(parent.value)) parent.value.push(value)
    else
      Object.defineProperty(parent.value, parent.key!, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      })
  }
  const open = (value: any, key?: string) => {
    value.incomplete = true
    attach(value)
    stack.push({ value, key })
  }
  const close = () => {
    delete stack.pop()!.value.incomplete
    if (!stack.length) complete = true
  }
  parser.onopenobject = (key) => open({}, key)
  parser.onkey = (key) => {
    stack[stack.length - 1].key = key
  }
  parser.onopenarray = () => open([])
  parser.oncloseobject = close
  parser.onclosearray = close
  parser.onvalue = attach
  parser.onerror = () => {
    throw new Error('Malformed legacy database JSON')
  }
  return stream
}
