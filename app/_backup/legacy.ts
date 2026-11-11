import { blobChunks } from './streams'
// Incremental framing of historical raw arrays. At most one record is parsed at
// once; invalid/truncated input rejects the candidate, never the live library.
export async function* legacyRows(file: Blob, signal?: AbortSignal) {
  const decoder = new TextDecoder('utf-8', { fatal: true })
  let started = false,
    ended = false,
    inString = false,
    escaped = false,
    depth = 0,
    buffer = '',
    needValue = true,
    hadValue = false
  for await (const bytes of blobChunks(file, signal)) {
    for (const c of decoder.decode(bytes, { stream: true })) {
      if (!started) {
        if (/\s/.test(c)) continue
        if (c !== '[') throw new Error('Expected a legacy image array')
        started = true
        continue
      }
      if (ended) {
        if (!/\s/.test(c)) throw new Error('Unexpected data after image array')
        continue
      }
      if (!buffer) {
        if (/\s/.test(c)) continue
        if (c === ']') {
          if (needValue && hadValue)
            throw new Error('Trailing comma in image array')
          ended = true
          continue
        }
        if (c === ',') {
          if (needValue) throw new Error('Missing image record')
          needValue = true
          continue
        }
        if (!needValue || c !== '{') throw new Error('Expected an image record')
      }
      buffer += c
      if (inString) {
        if (escaped) escaped = false
        else if (c === '\\') escaped = true
        else if (c === '"') inString = false
      } else if (c === '"') inString = true
      else if (c === '{' || c === '[') depth++
      else if (c === '}' || c === ']') depth--
      if (!inString && depth === 0) {
        const row = JSON.parse(buffer)
        buffer = ''
        hadValue = true
        needValue = false
        if (!row || Array.isArray(row) || typeof row !== 'object')
          throw new Error('Invalid image record')
        yield row as Record<string, unknown>
      }
    }
  }
  decoder.decode()
  if (!started || !ended || buffer || inString)
    throw new Error('Incomplete legacy image array')
}
