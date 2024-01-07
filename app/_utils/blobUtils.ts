// @ts-nocheck
import * as exifLib from '@asc0910/exif-library'
import { writeJPGMarker, writePNGtext, writeXMP } from 'image-metadata-editor'

const SOFTWARE =
  'ArtBot - Create images with Stable Diffusion, utilizing the AI Horde'

export const initBlob = () => {
  if (!Blob.prototype.toPNG) {
    Blob.prototype.toPNG = async function (callback: any) {
      // Converting through canvas will remove exif data
      // So extract exif first, and then add it back when creating new blob
      const exif = await getExifFromBlob(this)
      return await convertBlob(this, 'image/png', callback, exif)
    }
  }

  if (!Blob.prototype.toWebP) {
    Blob.prototype.toWebP = async function (callback: any) {
      const exif = await getExifFromBlob(this)
      return await convertBlob(this, 'image/webp', callback, exif)
    }
  }

  if (!Blob.prototype.toJPEG) {
    Blob.prototype.toJPEG = async function (callback: any) {
      const exif = await getExifFromBlob(this)
      return await convertBlob(this, 'image/jpeg', callback, exif)
    }
  }

  if (!Blob.prototype.addOrUpdateExifData) {
    Blob.prototype.addOrUpdateExifData = async function (
      userComment: string
    ): Blob {
      return await writeMetadata(this, mergeExifData({}, userComment))
    }
  }
}

function loadImage(src: string) {
  return new Promise((resolve, reject) => {
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

async function writeMetadata(imageBlob: Blob, exif: object): Blob {
  const userComment = exif.Exif[37510].replace('ASCII\0\0\0', '')

  // Write Exif
  const imageExifBlob = await addOrUpdateExifData(imageBlob, userComment)

  // Write XMP and Additional markers
  if (
    imageExifBlob.type === 'image/png' ||
    imageExifBlob.type === 'image/jpeg'
  ) {
    const xmp = `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:exif="http://ns.adobe.com/exif/1.0/"><dc:title><rdf:Alt><rdf:li xml:lang="x-default"><![CDATA[${userComment}]]></rdf:li></rdf:Alt></dc:title><exif:UserComment><![CDATA[${userComment}]]></exif:UserComment></rdf:Description></rdf:RDF></x:xmpmeta>
	`
    let imageUint8Arr = await writeXMP(imageExifBlob, xmp)
    if (imageExifBlob.type === 'image/png') {
      // https://exiftool.org/TagNames/PNG.html#TextualData
      imageUint8Arr = await writePNGtext(
        imageUint8Arr,
        'parameters',
        userComment
      )
      imageUint8Arr = await writePNGtext(imageUint8Arr, 'Comment', userComment)
      imageUint8Arr = await writePNGtext(
        imageUint8Arr,
        'Description',
        userComment
      )
      imageUint8Arr = await writePNGtext(imageUint8Arr, 'Software', SOFTWARE)

      var exifBytes = exifLib.dump(exif)
      const EXIF_CODE = 'Exif\x00\x00'
      if (exifBytes.startsWith(EXIF_CODE)) {
        exifBytes = exifBytes.slice(6)
      }
    }
    if (imageExifBlob.type === 'image/jpeg') {
      imageUint8Arr = await writeJPGMarker(imageUint8Arr, userComment)
    }

    return new Blob([imageUint8Arr], { type: imageExifBlob.type })
  }
  return imageExifBlob
}

async function convertBlob(
  blob: Blob,
  mimeType: string,
  callback: (arg0: Blob) => void,
  exif: any = {}
): Blob {
  let convertedBlob: Blob
  if (blob.type !== mimeType) {
    const image = await loadImage(URL.createObjectURL(blob))
    const canvas = <HTMLCanvasElement>createTempCanvas()
    const ctx = canvas.getContext('2d')
    canvas.width = image.width
    canvas.height = image.height
    ctx.drawImage(image, 0, 0)

    convertedBlob = URI2Blob(canvas.toDataURL(mimeType, 1), mimeType)
  } else {
    convertedBlob = blob
  }

  const result = await writeMetadata(convertedBlob, exif)

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

async function getExifFromBlob(blob: Blob): object {
  const bytes = await blobToBase64(blob)
  let existing_exif = {}
  try {
    existing_exif = exifLib.load(bytes)
  } catch (e) {}
  return existing_exif
}

function str_to_utf8(str) {
  // Firstly, encode the string as UTF-8
  const utf8Encoded = encodeURIComponent(str)

  // Secondly, replace any URI special characters with their UTF-8 equivalents
  const utf8Bytes = utf8Encoded.replace(
    /%([0-9A-F]{2})/g,
    function (match, p1) {
      return String.fromCharCode('0x' + p1)
    }
  )

  // Finally, encode the UTF-8 byte sequence to Base64
  return utf8Bytes
}

function mergeExifData(existingExif: object, userComment: string): object {
  userComment = str_to_utf8(userComment)

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

async function addOrUpdateExifData(blob: Blob, userComment: string): Blob {
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
