/**
 * Writes text metadata into PNG and JPEG bytes.
 *
 * This replaces the `image-metadata-editor` package, which was last published
 * in 2023 and depends on a vulnerable version of fast-xml-parser. The output is
 * byte for byte what that package wrote, so images saved before and after the
 * change carry the same metadata.
 */

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47]
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff]

// The signature (8 bytes) plus the IHDR chunk (25 bytes), which the PNG format
// requires to come first. New chunks go straight after it.
const PNG_AFTER_IHDR = 33

// After the JPEG start-of-image marker.
const JPEG_AFTER_SOI = 2

const XMP_PNG_KEYWORD = 'XML:com.adobe.xmp'
const XMP_JPEG_NAMESPACE = 'http://ns.adobe.com/xap/1.0/\0'

const COM_MARKER = [0xff, 0xfe]
const APP1_MARKER = [0xff, 0xe1]

const startsWith = (bytes: Uint8Array, signature: number[]) =>
  signature.every((byte, i) => bytes[i] === byte)

const isPng = (bytes: Uint8Array) => startsWith(bytes, PNG_SIGNATURE)
const isJpeg = (bytes: Uint8Array) => startsWith(bytes, JPEG_SIGNATURE)

let crcTable: Uint32Array | undefined

const getCrcTable = () => {
  if (!crcTable) {
    crcTable = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      }
      crcTable[n] = c >>> 0
    }
  }
  return crcTable
}

/** The CRC-32 that PNG chunks use. */
export const crc32 = (bytes: Uint8Array) => {
  const table = getCrcTable()
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) {
    crc = table[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

const insertAt = (bytes: Uint8Array, position: number, insert: Uint8Array) => {
  const result = new Uint8Array(bytes.length + insert.length)
  result.set(bytes.subarray(0, position))
  result.set(insert, position)
  result.set(bytes.subarray(position), position + insert.length)
  return result
}

/**
 * Adds a tEXt chunk after the PNG header. The text is stored as UTF-8, as
 * ArtBot always has, so prompts in any language read back unchanged.
 */
export const writePNGtext = (png: Uint8Array, key: string, value: string) => {
  if (!isPng(png)) {
    throw new TypeError('A PNG is required to write PNG text')
  }

  const data = new TextEncoder().encode(`${key}\0${value}`)
  const chunk = new Uint8Array(data.length + 12)
  const view = new DataView(chunk.buffer)

  view.setUint32(0, data.length)
  chunk.set(new TextEncoder().encode('tEXt'), 4)
  chunk.set(data, 8)
  view.setUint32(data.length + 8, crc32(chunk.subarray(4, data.length + 8)))

  return insertAt(png, PNG_AFTER_IHDR, chunk)
}

/**
 * Adds a JPEG marker segment after the start-of-image marker. Defaults to a
 * comment (COM) segment.
 */
export const writeJPGMarker = (
  jpeg: Uint8Array,
  value: string,
  marker: number[] = COM_MARKER
) => {
  if (!isJpeg(jpeg)) {
    throw new TypeError('A JPEG is required to write a JPEG marker')
  }

  const data = new TextEncoder().encode(value)
  // A segment's length field counts itself, and is 16 bits.
  if (data.length + 2 > 0xffff) {
    throw new RangeError('The text is too long for a JPEG segment')
  }

  const segment = new Uint8Array(data.length + 4)
  segment.set(marker, 0)
  new DataView(segment.buffer).setUint16(2, data.length + 2)
  segment.set(data, 4)

  return insertAt(jpeg, JPEG_AFTER_SOI, segment)
}

/** Adds an XMP packet to a PNG or JPEG. */
export const writeXMP = (image: Uint8Array, xmp: string) => {
  if (isPng(image)) {
    return writePNGtext(image, XMP_PNG_KEYWORD, xmp)
  }

  if (isJpeg(image)) {
    return writeJPGMarker(image, `${XMP_JPEG_NAMESPACE}${xmp}`, APP1_MARKER)
  }

  throw new TypeError('XMP can only be written to a PNG or JPEG')
}

/**
 * Wraps text in CDATA so it is always valid XML. A `]]>` inside the text would
 * end the section early, so it is split across two sections.
 */
export const toCdata = (text: string) =>
  `<![CDATA[${text.split(']]>').join(']]]]><![CDATA[>')}]]>`
