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
