/**
 * @jest-environment ./test-utils/jsdomWithIndexedDb.js
 *
 * Writes metadata into real images. Converting between formats needs a canvas,
 * so that part is covered by e2e/download.spec.ts.
 */
import * as exifLib from '@asc0910/exif-library'
import sharp from 'sharp'
import { blobToBase64, initBlob } from './blobUtils'

const userComment = async (blob: Blob) => {
  const exif = exifLib.load(await blobToBase64(blob))
  return exif.Exif?.[exifLib.TagNumbers.ExifIFD.UserComment]
}

const software = async (blob: Blob) => {
  const exif = exifLib.load(await blobToBase64(blob))
  return exif['0th']?.[exifLib.TagNumbers.ImageIFD.Software]
}

describe('Blob.addOrUpdateExifData', () => {
  let webp: Blob

  beforeAll(async () => {
    initBlob()
    const bytes = await sharp({
      create: { width: 8, height: 8, channels: 3, background: 'red' }
    })
      .webp()
      .toBuffer()
    webp = new Blob([new Uint8Array(bytes)], { type: 'image/webp' })
  })

  it('writes the prompt into an image with no metadata', async () => {
    const stamped = await webp.addOrUpdateExifData('a red square')

    expect(stamped.type).toBe('image/webp')
    expect(await userComment(stamped)).toBe('ASCII\0\0\0a red square')
  })

  it('replaces the prompt in an image that already has one', async () => {
    const first = await webp.addOrUpdateExifData('first prompt')
    const second = await first.addOrUpdateExifData('second prompt')

    expect(await userComment(second)).toBe('ASCII\0\0\0second prompt')
  })

  it('accepts an empty prompt', async () => {
    const stamped = await webp.addOrUpdateExifData('')

    expect(stamped.type).toBe('image/webp')
    expect(await userComment(stamped)).toBeUndefined()
    expect(await software(stamped)).toContain('ArtBot')
  })
})

// jsdom's Blob has no arrayBuffer(), which the JPEG and PNG metadata path uses.
const readArrayBuffer = function (this: Blob) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(this)
  })
}

// A JPEG's EXIF data is one segment, which holds at most 64 KB.
describe('a prompt too long for a JPEG', () => {
  let jpeg: Blob

  beforeAll(async () => {
    if (!Blob.prototype.arrayBuffer)
      Blob.prototype.arrayBuffer = readArrayBuffer
    initBlob()
    const bytes = await sharp({
      create: { width: 8, height: 8, channels: 3, background: 'red' }
    })
      .jpeg()
      .toBuffer()
    jpeg = new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' })
  })

  it('is left out, and the image stays valid', async () => {
    // About 75 KB once encoded as UTF-8.
    const prompt = 'café '.repeat(12500)

    const stamped = await jpeg.addOrUpdateExifData(prompt)

    expect(stamped.type).toBe('image/jpeg')
    const metadata = await sharp(
      Buffer.from(await stamped.arrayBuffer())
    ).metadata()
    expect(metadata.format).toBe('jpeg')
    expect(await userComment(stamped)).toBeUndefined()
    expect(await software(stamped)).toContain('ArtBot')
  })

  it('is kept when it fits', async () => {
    const stamped = await jpeg.addOrUpdateExifData('a red square')

    expect(await userComment(stamped)).toBe('ASCII\0\0\0a red square')
  })
})
