// WebKit has substantial per-read overhead for disk-backed Blobs. Read bounded
// windows, independently of serialization chunk/part sizes. Never read an
// entire image/library just to avoid that overhead.
export const BLOB_READ_BYTES = 1024 * 1024
export async function* blobChunks(file: Blob, signal?: AbortSignal) {
  for (let offset = 0; offset < file.size; offset += BLOB_READ_BYTES) {
    if (signal?.aborted)
      throw new DOMException('Backup operation paused', 'AbortError')
    yield new Uint8Array(
      await file.slice(offset, offset + BLOB_READ_BYTES).arrayBuffer()
    )
  }
}
