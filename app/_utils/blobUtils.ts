import * as exifLib from '@asc0910/exif-library'
import type { IExif } from '@asc0910/exif-library'
import {
  toCdata,
  writeJPGMarker,
  writePNGtext,
  writeXMP
} from './imageMetadata'

const SOFTWARE =
  'ArtBot - Create images with Stable Diffusion, utilizing the AI Horde'

type BlobConversionCallback = (blob: Blob) => void

/**
 * Converts a blob to another image format, preserving exif data. Without a
 * callback the converted blob is returned; with a callback the converted blob
 * is passed to it and the promise resolves to undefined.
 */
interface BlobConverter {
  (callback?: null): Promise<Blob>
  (callback: BlobConversionCallback): Promise<undefined>
}

declare global {
  interface Blob {
    /** Added by initBlob() */
    toPNG: BlobConverter
    /** Added by initBlob() */
    toWebP: BlobConverter
    /** Added by initBlob() */
    toJPEG: BlobConverter
    /** Added by initBlob() */
    addOrUpdateExifData(userComment: string): Promise<Blob>
  }
}

export const initBlob = () => {
  if (!Blob.prototype.toPNG) {
    Blob.prototype.toPNG = async function (
      this: Blob,
      callback?: BlobConversionCallback | null
    ) {
      // Converting through canvas will remove exif data
      // So extract exif first, and then add it back when creating new blob
      const exif = await getExifFromBlob(this)
      return await convertBlob(this, 'image/png', callback, exif)
    } as BlobConverter
  }

  if (!Blob.prototype.toWebP) {
    Blob.prototype.toWebP = async function (
      this: Blob,
      callback?: BlobConversionCallback | null
    ) {
      const exif = await getExifFromBlob(this)
      return await convertBlob(this, 'image/webp', callback, exif)
    } as BlobConverter
  }

  if (!Blob.prototype.toJPEG) {
    Blob.prototype.toJPEG = async function (
      this: Blob,
      callback?: BlobConversionCallback | null
    ) {
      const exif = await getExifFromBlob(this)
      return await convertBlob(this, 'image/jpeg', callback, exif)
    } as BlobConverter
  }

  if (!Blob.prototype.addOrUpdateExifData) {
    Blob.prototype.addOrUpdateExifData = async function (
      userComment: string
    ): Promise<Blob> {
      return await writeMetadata(this, userComment)
    }
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      resolve(image)
    }
    image.onerror = (error) => {
      reject(error)
    }
    image.src = src
  })
}

// EXIF strings hold one byte per character, so the prompt is stored as its
// UTF-8 bytes. Everywhere else in this file it's ordinary text.
const encodeUtf8Bytes = (text: string) =>
  Array.from(new TextEncoder().encode(text), (byte) =>
    String.fromCharCode(byte)
  ).join('')

const decodeUtf8Bytes = (bytes: string) =>
  new TextDecoder('utf-8', { fatal: true }).decode(
    Uint8Array.from(bytes, (char) => char.charCodeAt(0))
  )

// Earlier versions encoded the prompt two or more times, so decoding repeats
// while the result is still valid UTF-8. Text that was never encoded, or that
// has characters outside one byte, is left as it is.
const MAX_DECODES = 4
const decodeComment = (comment: string) => {
  let text = comment

  for (let i = 0; i < MAX_DECODES && /^[\x00-\xff]*$/.test(text); i++) {
    try {
      const decoded = decodeUtf8Bytes(text)
      if (decoded === text) break
      text = decoded
    } catch (err) {
      break
    }
  }

  return text
}

// Images saved by older versions, or imported, may have no EXIF data or no
// prompt in it.
const readUserComment = (exif: IExif) => {
  const comment = exif.Exif?.[exifLib.TagNumbers.ExifIFD.UserComment]

  if (typeof comment !== 'string') {
    return ''
  }

  return decodeComment(comment.replace('ASCII\0\0\0', ''))
}

async function writeMetadata(
  imageBlob: Blob,
  userComment: string
): Promise<Blob> {
  // Write Exif
  const imageExifBlob = await addOrUpdateExifData(imageBlob, userComment)

  // Write XMP and Additional markers. They only hold the prompt.
  if (
    userComment &&
    (imageExifBlob.type === 'image/png' || imageExifBlob.type === 'image/jpeg')
  ) {
    const xmp = `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:exif="http://ns.adobe.com/exif/1.0/"><dc:title><rdf:Alt><rdf:li xml:lang="x-default">${toCdata(userComment)}</rdf:li></rdf:Alt></dc:title><exif:UserComment>${toCdata(userComment)}</exif:UserComment></rdf:Description></rdf:RDF></x:xmpmeta>
	`
    const bytes = new Uint8Array(await imageExifBlob.arrayBuffer())
    let imageUint8Arr: Uint8Array<ArrayBuffer>

    if (imageExifBlob.type === 'image/png') {
      imageUint8Arr = writeXMP(bytes, xmp)
      // https://exiftool.org/TagNames/PNG.html#TextualData
      imageUint8Arr = writePNGtext(imageUint8Arr, 'parameters', userComment)
      imageUint8Arr = writePNGtext(imageUint8Arr, 'Comment', userComment)
      imageUint8Arr = writePNGtext(imageUint8Arr, 'Description', userComment)
      imageUint8Arr = writePNGtext(imageUint8Arr, 'Software', SOFTWARE)
    } else {
      // A JPEG segment holds at most 64 KB, so a prompt too long for one is
      // left out of it. It is still in the EXIF data.
      imageUint8Arr = bytes
      for (const write of [
        (jpeg: Uint8Array<ArrayBuffer>) => writeXMP(jpeg, xmp),
        (jpeg: Uint8Array<ArrayBuffer>) => writeJPGMarker(jpeg, userComment)
      ]) {
        try {
          imageUint8Arr = write(imageUint8Arr)
        } catch (err) {
          if (!(err instanceof RangeError)) throw err
        }
      }
    }

    return new Blob([imageUint8Arr], { type: imageExifBlob.type })
  }
  return imageExifBlob
}

async function convertBlob(
  blob: Blob,
  mimeType: string,
  callback: BlobConversionCallback | null | undefined,
  exif: IExif = {}
): Promise<Blob | undefined> {
  let convertedBlob: Blob
  if (blob.type !== mimeType) {
    const image = await loadImage(URL.createObjectURL(blob))
    const canvas = <HTMLCanvasElement>createTempCanvas()
    const ctx = canvas.getContext('2d')
    canvas.width = image.width
    canvas.height = image.height
    // A freshly created canvas always provides a 2d context
    ctx!.drawImage(image, 0, 0)

    convertedBlob = URI2Blob(canvas.toDataURL(mimeType, 1), mimeType)
  } else {
    convertedBlob = blob
  }

  const result = await writeMetadata(convertedBlob, readUserComment(exif))

  if (callback) {
    callback(result)
  } else {
    return result
  }
}

function createTempCanvas() {
  let canvas = document.createElement('CANVAS')
  canvas.style.display = 'none'
  return canvas
}

function URI2Blob(dataURI: string, mimeType: string): Blob {
  const imageBytes = atob(dataURI.split(',')[1])

  var arrayBuf = new ArrayBuffer(imageBytes.length)
  var intArr = new Uint8Array(arrayBuf)
  for (var i = 0; i < imageBytes.length; i++) {
    intArr[i] = imageBytes.charCodeAt(i)
  }

  return new Blob([intArr], { type: mimeType })
}

async function getExifFromBlob(blob: Blob): Promise<IExif> {
  const bytes = await blobToBase64(blob)
  let existing_exif: IExif = {}
  try {
    existing_exif = exifLib.load(bytes)
  } catch (e) {}
  return existing_exif
}

function mergeExifData(existingExif: IExif, userComment: string): IExif {
  userComment = encodeUtf8Bytes(userComment)

  // 0th IFD
  const zeroth = {
    [exifLib.TagNumbers.ImageIFD.Software]: SOFTWARE
  }
  // exif IFD
  const exif = userComment
    ? {
        [exifLib.TagNumbers.ExifIFD.UserComment]: `ASCII\0\0\0${userComment}`
      }
    : {}
  // exif main obj
  const exifObj = {
    ...existingExif,
    '0th': existingExif['0th'] ? { ...existingExif['0th'], ...zeroth } : zeroth,
    Exif: existingExif.Exif ? { ...existingExif.Exif, ...exif } : exif
  }
  return exifObj
}

async function addOrUpdateExifData(
  blob: Blob,
  userComment: string
): Promise<Blob> {
  const imageBytes = await blobToBase64(blob)
  const newExif = await mergeExifData(await getExifFromBlob(blob), userComment)
  const exifbytes = exifLib.dump(newExif)
  const result = exifLib.insert(exifbytes, imageBytes)
  return await URI2Blob(result, blob.type)
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = function () {
      if (reader.result) {
        resolve(reader.result as string)
      } else {
        const err = new Error('Failed to convert blob to base64')
        console.error(err)
        reject(err)
      }
    }
    reader.onerror = function (error) {
      reject(error)
    }
    reader.readAsDataURL(blob)
  })
}
