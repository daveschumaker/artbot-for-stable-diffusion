/* global BufferSource, IDBValidKey, BlobPart */
import { BLOB_READ_BYTES } from './streams'
// Versioned structured-clone graph. Large strings and binary data are separate
// bounded lines, so a large Blob never requires a full base64 string in memory.
type Atom = { ref: number } | { primitive: string; value?: string | boolean }
type Node = { type: string; [key: string]: any }
export interface Chunk {
  kind: 'chunk'
  payload: number
  encoding: 'text' | 'base64'
  index: number
  data: string
  hash: string
}
export interface EncodedRecord {
  kind: 'record'
  table: string
  root: Atom
  nodes: Node[]
  payloads: { encoding: string; chunks: number; digest: string }[]
  fingerprint: string
}
export const utf8 = (value: string) => new TextEncoder().encode(value)
export async function sha(bytes: BufferSource) {
  return Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)),
    (b) => b.toString(16).padStart(2, '0')
  ).join('')
}
export const hashJSON = (value: unknown) => sha(utf8(JSON.stringify(value)))
function base64(bytes: Uint8Array) {
  let value = ''
  for (let i = 0; i < bytes.length; i += 8192)
    value += String.fromCharCode(...bytes.subarray(i, i + 8192))
  return btoa(value)
}
function unbase64(value: string) {
  const s = atob(value)
  return Uint8Array.from(s, (c) => c.charCodeAt(0))
}
const views: Record<string, any> = {
  Int8Array,
  Uint8Array,
  Uint8ClampedArray,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array,
  DataView,
  BigInt64Array,
  BigUint64Array
}
const tag = (value: unknown) =>
  Object.prototype.toString.call(value).slice(8, -1)
export async function encodeRecord(
  table: string,
  key: IDBValidKey,
  value: unknown,
  chunkBytes = 128 * 1024
) {
  const nodes: Node[] = [],
    seen = new Map<object, number>(),
    lines: Blob[] = []
  const payloads: EncodedRecord['payloads'] = []
  async function payload(value: string | Blob | ArrayBuffer) {
    const id = payloads.length,
      encoding = typeof value === 'string' ? 'text' : 'base64'
    const meta = { encoding, chunks: 0, digest: '' }
    payloads.push(meta)
    let offset = 0
    let windowStart = 0,
      windowEnd = 0,
      window: Uint8Array | undefined
    const isBlob = tag(value) === 'Blob' || tag(value) === 'File'
    const size =
      typeof value === 'string'
        ? value.length
        : isBlob
          ? (value as Blob).size
          : (value as ArrayBuffer).byteLength
    while (offset < size) {
      let data: string
      if (typeof value === 'string') {
        let end = Math.min(
          size,
          offset + Math.max(2, Math.floor(chunkBytes / 8))
        )
        if (end < size && /[\uD800-\uDBFF]/.test(value[end - 1])) end--
        data = value.slice(offset, end)
        offset = end
      } else {
        const end = Math.min(size, offset + chunkBytes)
        let bytes: Uint8Array
        if (isBlob) {
          if (!window || offset < windowStart || end > windowEnd) {
            windowStart = offset
            windowEnd = Math.min(
              size,
              offset + Math.max(BLOB_READ_BYTES, chunkBytes)
            )
            window = new Uint8Array(
              await (value as Blob).slice(windowStart, windowEnd).arrayBuffer()
            )
          }
          bytes = window.subarray(offset - windowStart, end - windowStart)
        } else
          bytes = new Uint8Array(value as ArrayBuffer, offset, end - offset)
        data = base64(bytes)
        offset = end
      }
      const hash =
        encoding === 'text' ? await hashJSON(data) : await sha(unbase64(data))
      const line: Chunk = {
        kind: 'chunk',
        payload: id,
        encoding,
        index: meta.chunks,
        data,
        hash
      }
      meta.chunks++
      meta.digest = await hashJSON([meta.digest, hash])
      lines.push(new Blob([JSON.stringify(line) + '\n']))
    }
    return id
  }
  async function encode(v: any): Promise<Atom> {
    if (v === null) return { primitive: 'null' }
    if (v === undefined) return { primitive: 'undefined' }
    if (typeof v === 'boolean') return { primitive: 'boolean', value: v }
    if (typeof v === 'number')
      return { primitive: 'number', value: Object.is(v, -0) ? '-0' : String(v) }
    if (typeof v === 'bigint') return { primitive: 'bigint', value: String(v) }
    if (typeof v === 'string' && v.length <= Math.floor(chunkBytes / 8))
      return { primitive: 'string', value: v }
    if (typeof v !== 'object' && typeof v !== 'string')
      throw new Error(`Unsupported backup value: ${typeof v}`)
    if (typeof v === 'object' && seen.has(v)) return { ref: seen.get(v)! }
    const ref = nodes.length
    nodes.push({ type: 'pending' })
    if (typeof v === 'object') seen.set(v, ref)
    let node: Node
    if (typeof v === 'string')
      node = { type: 'text', payload: await payload(v), length: v.length }
    else if (tag(v) === 'Blob' || tag(v) === 'File')
      node = {
        type: tag(v) === 'File' ? 'file' : 'blob',
        payload: await payload(v),
        size: v.size,
        mime: v.type,
        ...(tag(v) === 'File' ? { name: v.name, modified: v.lastModified } : {})
      }
    else if (tag(v) === 'ArrayBuffer')
      node = { type: 'buffer', payload: await payload(v), size: v.byteLength }
    else if (ArrayBuffer.isView(v))
      node = {
        type: 'view',
        viewKind: v.constructor.name,
        buffer: await encode(v.buffer),
        offset: v.byteOffset,
        length: tag(v) === 'DataView' ? v.byteLength : (v as any).length
      }
    else if (tag(v) === 'Date')
      node = { type: 'date', value: String(v.getTime()) }
    else if (tag(v) === 'RegExp')
      node = {
        type: 'regexp',
        source: v.source,
        flags: v.flags,
        lastIndex: v.lastIndex
      }
    else if (tag(v) === 'Map') {
      const entries = []
      for (const [k, x] of v) entries.push([await encode(k), await encode(x)])
      node = { type: 'map', entries }
    } else if (tag(v) === 'Set') {
      const entries = []
      for (const x of v) entries.push(await encode(x))
      node = { type: 'set', entries }
    } else if (Array.isArray(v) || tag(v) === 'Object') {
      const props = []
      for (const k of Object.keys(v).sort()) props.push([k, await encode(v[k])])
      node = {
        type: Array.isArray(v) ? 'array' : 'object',
        ...(Array.isArray(v) ? { length: v.length } : {}),
        props
      }
    } else
      throw new Error(
        `Unsupported backup type: ${
          v.constructor?.name || 'unknown'
        }. The original library has not been changed.`
      )
    nodes[ref] = node
    return { ref }
  }
  const root = await encode([key, value])
  const fingerprint = await hashJSON({ root, nodes, payloads })
  const footer: EncodedRecord = {
    kind: 'record',
    table,
    root,
    nodes,
    payloads,
    fingerprint
  }
  lines.push(new Blob([JSON.stringify(footer) + '\n']))
  return {
    lines,
    fingerprint,
    bytes: lines.reduce((sum, b) => sum + b.size, 0)
  }
}

export class RecordDecoder {
  private payloads: {
    encoding: string
    chunks: number
    digest: string
    values: (string | Blob)[]
  }[] = []
  async accept(
    line: Chunk | EncodedRecord
  ): Promise<
    | { table: string; key: IDBValidKey; value: any; fingerprint: string }
    | undefined
  > {
    if (line.kind === 'chunk') {
      if (
        !Number.isInteger(line.payload) ||
        line.payload < 0 ||
        line.payload > 1000000 ||
        !['text', 'base64'].includes(line.encoding)
      )
        throw new Error('Invalid backup payload')
      const p =
        this.payloads[line.payload] ||
        (this.payloads[line.payload] = {
          encoding: line.encoding,
          chunks: 0,
          digest: '',
          values: []
        })
      if (p.encoding !== line.encoding || p.chunks !== line.index)
        throw new Error('Missing or out-of-order payload chunk')
      const bytes =
        line.encoding === 'text' ? utf8(line.data) : unbase64(line.data)
      if (
        (line.encoding === 'text'
          ? await hashJSON(line.data)
          : await sha(bytes)) !== line.hash
      )
        throw new Error('Payload checksum mismatch')
      p.chunks++
      p.digest = await hashJSON([p.digest, line.hash])
      p.values.push(
        line.encoding === 'text' ? line.data : new Blob([bytes as BlobPart])
      )
      return
    }
    if (
      line.kind !== 'record' ||
      typeof line.table !== 'string' ||
      !Array.isArray(line.nodes) ||
      !Array.isArray(line.payloads)
    )
      throw new Error('Invalid backup record')
    const summary = this.payloads.map((p) => ({
      encoding: p.encoding,
      chunks: p.chunks,
      digest: p.digest
    }))
    // Empty payloads have no chunk lines, but remain described in the footer.
    for (let i = 0; i < line.payloads.length; i++)
      if (
        !this.payloads[i] &&
        line.payloads[i].chunks === 0 &&
        line.payloads[i].digest === ''
      ) {
        this.payloads[i] = { ...line.payloads[i], values: [] }
        summary[i] = line.payloads[i]
      }
    if (
      JSON.stringify(summary) !== JSON.stringify(line.payloads) ||
      (await hashJSON({
        root: line.root,
        nodes: line.nodes,
        payloads: summary
      })) !== line.fingerprint
    )
      throw new Error('Record checksum mismatch')
    const revived = new Map<number, any>()
    const binary = (n: Node) => {
      const p = this.payloads[n.payload]
      if (!p || p.encoding !== 'base64')
        throw new Error('Missing binary payload')
      const blob = new Blob(p.values as BlobPart[], { type: n.mime || '' })
      if (blob.size !== n.size) throw new Error('Binary length mismatch')
      return blob
    }
    const decode = async (atom: Atom): Promise<any> => {
      if ('primitive' in atom) {
        switch (atom.primitive) {
          case 'null':
            return null
          case 'undefined':
            return undefined
          case 'boolean':
            if (typeof atom.value !== 'boolean') break
            return atom.value
          case 'string':
            if (typeof atom.value !== 'string') break
            return atom.value
          case 'number':
            return Number(atom.value)
          case 'bigint':
            return BigInt(atom.value as string)
        }
        throw new Error('Invalid primitive in backup')
      }
      const id = atom.ref
      if (!Number.isInteger(id) || id < 0 || id >= line.nodes.length)
        throw new Error('Invalid backup reference')
      if (revived.has(id)) return revived.get(id)
      const n = line.nodes[id]
      let value: any
      switch (n.type) {
        case 'object':
          value = {}
          break
        case 'array':
          value = new Array(n.length)
          break
        case 'map':
          value = new Map()
          break
        case 'set':
          value = new Set()
          break
        case 'date':
          value = new Date(Number(n.value))
          break
        case 'regexp':
          value = new RegExp(n.source, n.flags)
          value.lastIndex = n.lastIndex
          break
        case 'text': {
          const p = this.payloads[n.payload]
          if (!p || p.encoding !== 'text')
            throw new Error('Missing text payload')
          value = p.values.join('')
          if (value.length !== n.length) throw new Error('Text length mismatch')
          break
        }
        case 'blob':
          value = binary(n)
          break
        case 'file':
          value = new File([binary(n)], n.name, {
            type: n.mime,
            lastModified: n.modified
          })
          break
        case 'buffer':
          value = await binary(n).arrayBuffer()
          break
        case 'view': {
          if (!Object.hasOwn(views, n.viewKind))
            throw new Error('Unknown typed array')
          value = new views[n.viewKind](
            await decode(n.buffer),
            n.offset,
            n.length
          )
          break
        }
        default:
          throw new Error('Unsupported backup record type')
      }
      revived.set(id, value)
      if (n.props)
        for (const [key, child] of n.props)
          Object.defineProperty(value, key, {
            value: await decode(child),
            enumerable: true,
            configurable: true,
            writable: true
          })
      if (n.type === 'map')
        for (const [key, child] of n.entries)
          value.set(await decode(key), await decode(child))
      if (n.type === 'set')
        for (const child of n.entries) value.add(await decode(child))
      return value
    }
    const [key, value] = await decode(line.root)
    this.payloads = []
    return { table: line.table, key, value, fingerprint: line.fingerprint }
  }
  finish() {
    if (this.payloads.length) throw new Error('Incomplete backup record')
  }
}
