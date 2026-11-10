/**
 * Writes metadata into real PNG and JPEG bytes and reads it back.
 */
import sharp from 'sharp'
import zlib from 'zlib'
import {
  crc32,
  toCdata,
  writeJPGMarker,
  writePNGtext,
  writeXMP
} from './imageMetadata'

// zlib.crc32 is in Node 20.15 and later. The installed @types/node predates it.
const zlibCrc32 = (
  zlib as unknown as { crc32: (data: Uint8Array | string) => number }
).crc32

const image = async (format: 'png' | 'jpeg') =>
  new Uint8Array(
    await sharp({
      create: { width: 8, height: 8, channels: 3, background: 'blue' }
    })
      [format]()
      .toBuffer()
  )

type PngChunk = { type: string; data: Buffer; crcValid: boolean }

const pngChunks = (png: Uint8Array): PngChunk[] => {
  const buf = Buffer.from(png)
  const chunks: PngChunk[] = []
  let pos = 8
  while (pos < buf.length) {
    const length = buf.readUInt32BE(pos)
    const type = buf.toString('latin1', pos + 4, pos + 8)
    const data = buf.subarray(pos + 8, pos + 8 + length)
    const crc = buf.readUInt32BE(pos + 8 + length)
    chunks.push({
      type,
      data,
      crcValid: crc === zlibCrc32(buf.subarray(pos + 4, pos + 8 + length))
    })
    pos += length + 12
  }
  return chunks
}

const pngText = (png: Uint8Array) =>
  pngChunks(png)
    .filter((chunk) => chunk.type === 'tEXt')
    .map((chunk) => {
      const text = chunk.data.toString('utf8')
      const split = text.indexOf('\0')
      return [text.slice(0, split), text.slice(split + 1)]
    })

type JpegSegment = { marker: number; data: Buffer }

const jpegSegments = (jpeg: Uint8Array): JpegSegment[] => {
  const buf = Buffer.from(jpeg)
  const segments: JpegSegment[] = []
  let pos = 2
  // Stop at the start of scan, where image data begins.
  while (buf[pos] === 0xff && buf[pos + 1] !== 0xda) {
    const length = buf.readUInt16BE(pos + 2)
    segments.push({
      marker: buf[pos + 1],
      data: buf.subarray(pos + 4, pos + 2 + length)
    })
    pos += 2 + length
  }
  return segments
}

describe('crc32', () => {
  it('matches zlib', () => {
    for (const text of ['', 'tEXtparameters', 'x'.repeat(10000)]) {
      expect(crc32(new TextEncoder().encode(text))).toBe(zlibCrc32(text))
    }
  })
})

describe('writePNGtext', () => {
  it('adds a valid tEXt chunk straight after IHDR', async () => {
    const png = writePNGtext(await image('png'), 'parameters', 'a red square')
    const chunks = pngChunks(png)

    expect(chunks.map((chunk) => chunk.type).slice(0, 2)).toEqual([
      'IHDR',
      'tEXt'
    ])
    expect(chunks.every((chunk) => chunk.crcValid)).toBe(true)
    expect(pngText(png)).toEqual([['parameters', 'a red square']])
  })

  it('keeps any language as UTF-8', async () => {
    const prompt = 'émoji 🎨 日本語'
    const png = writePNGtext(await image('png'), 'Comment', prompt)

    expect(pngText(png)).toEqual([['Comment', prompt]])
  })

  it('puts the newest chunk first and leaves the image readable', async () => {
    let png = writePNGtext(await image('png'), 'parameters', 'p')
    png = writePNGtext(png, 'Software', 's')

    expect(pngText(png)).toEqual([
      ['Software', 's'],
      ['parameters', 'p']
    ])
    expect((await sharp(Buffer.from(png)).metadata()).width).toBe(8)
  })

  it('rejects anything but a PNG', async () => {
    const jpeg = await image('jpeg')
    expect(() => writePNGtext(jpeg, 'k', 'v')).toThrow(TypeError)
  })
})

describe('writeJPGMarker', () => {
  it('adds a comment segment after the start of image', async () => {
    const jpeg = writeJPGMarker(await image('jpeg'), 'a red square 🎨')
    const [first] = jpegSegments(jpeg)

    expect(first.marker).toBe(0xfe)
    expect(first.data.toString('utf8')).toBe('a red square 🎨')
    expect((await sharp(Buffer.from(jpeg)).metadata()).width).toBe(8)
  })

  it('refuses text too long for a segment instead of corrupting the image', async () => {
    const jpeg = await image('jpeg')
    expect(() => writeJPGMarker(jpeg, 'x'.repeat(70000))).toThrow(RangeError)
  })

  it('rejects anything but a JPEG', async () => {
    const png = await image('png')
    expect(() => writeJPGMarker(png, 'v')).toThrow(TypeError)
  })
})

describe('writeXMP', () => {
  const xmp = '<x:xmpmeta xmlns:x="adobe:ns:meta/"/>'

  it('stores XMP in a PNG under the Adobe keyword', async () => {
    expect(pngText(writeXMP(await image('png'), xmp))).toEqual([
      ['XML:com.adobe.xmp', xmp]
    ])
  })

  it('stores XMP in a JPEG APP1 segment with the XMP namespace', async () => {
    const [first] = jpegSegments(writeXMP(await image('jpeg'), xmp))

    expect(first.marker).toBe(0xe1)
    expect(first.data.toString('utf8')).toBe(
      `http://ns.adobe.com/xap/1.0/\0${xmp}`
    )
  })

  it('rejects other formats', async () => {
    const webp = new Uint8Array(
      await sharp({
        create: { width: 8, height: 8, channels: 3, background: 'blue' }
      })
        .webp()
        .toBuffer()
    )
    expect(() => writeXMP(webp, xmp)).toThrow(TypeError)
  })
})

describe('toCdata', () => {
  it('wraps text unchanged', () => {
    expect(toCdata('a <red> & square')).toBe('<![CDATA[a <red> & square]]>')
  })

  it('splits a closing sequence so the section cannot end early', () => {
    const cdata = toCdata('a ]]> b')

    expect(cdata).toBe('<![CDATA[a ]]]]><![CDATA[> b]]>')
    // Joining the sections' contents gives back the original text.
    expect(
      [...cdata.matchAll(/<!\[CDATA\[([\s\S]*?)\]\]>/g)]
        .map((match) => match[1])
        .join('')
    ).toBe('a ]]> b')
  })
})
