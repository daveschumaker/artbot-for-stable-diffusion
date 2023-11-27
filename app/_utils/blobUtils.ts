// @ts-nocheck
import * as exifLib from '@asc0910/exif-library'
import { writeJPGMarker, writePNGtext, writeXMP } from 'image-metadata-editor'

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
    Blob.prototype.addOrUpdateExifData = function (userComment: string): Blob {
      return addOrUpdateExifData(this, userComment)
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

async function writeMetadata(imageBlob: Blob, userComment: string): Blob {
  // Write XMP and Additional markers
  if (imageBlob.type === 'image/png' || imageBlob.type === 'image/jpeg') {
    const xmp = `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:exif="http://ns.adobe.com/exif/1.0/"><dc:title><rdf:Alt><rdf:li xml:lang="x-default">${userComment}</rdf:li></rdf:Alt></dc:title><exif:UserComment><![CDATA[${userComment}]]></exif:UserComment></rdf:Description></rdf:RDF></x:xmpmeta>
	`
    let imageUint8Arr = await writeXMP(imageBlob, xmp)
    if (imageBlob.type === 'image/png') {
      imageUint8Arr = await writePNGtext(
        imageUint8Arr,
        'parameters',
        userComment
      )
    }
    if (imageBlob.type === 'image/jpeg') {
      imageUint8Arr = await writeJPGMarker(imageUint8Arr, userComment)
    }

    return new Blob([imageUint8Arr], { type: imageBlob.type })
  }
  return imageBlob
}

/**
 *
 * @param elem {any}
 * @param types {any[]}
 */
export function typeCheck(elem: any, types: any[]) {
  for (const _type of types) {
    if (typeof elem === _type) {
      return
    } else if (elem instanceof _type) {
      return
    }
  }
  throw new TypeError(`This type is not supported :(: ${typeof elem}`)
}

async function convertBlob(
  blob: Blob | MediaSource,
  type: string,
  callback: (arg0: Blob) => void,
  exif: any = {}
): Blob {
  const image = await loadImage(URL.createObjectURL(blob))
  const canvas = <HTMLCanvasElement>createTempCanvas()
  const ctx = canvas.getContext('2d')

  canvas.width = image.width
  canvas.height = image.height
  ctx.drawImage(image, 0, 0)
  // Add the exif data
  const imageBlob = dataURItoBlob(canvas.toDataURL(type, 1), exif)
  const userComment = exif.Exif[37510].replace('ASCII\0\0\0', '')
  const result = await writeMetadata(imageBlob, userComment)

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

function dataURItoBlob(dataURI: string, exif: any) {
  const imageInBytes = atob(dataURI.split(',')[1])
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  const imageOutBytes = byteStringWithExifData(imageInBytes, exif) // insert exif data

  var ab = new ArrayBuffer(imageOutBytes.length)
  var ia = new Uint8Array(ab)
  for (var i = 0; i < imageOutBytes.length; i++) {
    ia[i] = imageOutBytes.charCodeAt(i)
  }

  return new Blob([ia], { type: mimeString })
}

function getExifFromDataURI(dataURI: string): any {
  let existing_exif = {}
  try {
    existing_exif = exifLib.load(dataURI)
  } catch (e) {}
  return existing_exif
}

async function getExifFromBlob(blob: Blob) {
  const dataURI = await blobToBase64(blob)
  return getExifFromDataURI(dataURI)
}

function mergeExifData(existing_exif: object, userComment: string): object {
  // 0th IFD
  const zeroth = {
    [exifLib.TagNumbers.ImageIFD.Software]:
      'ArtBot - Create images with Stable Diffusion, utilizing the AI Horde'
  }
  // exif IFD
  const exif = userComment
    ? {
        [exifLib.TagNumbers.ExifIFD.UserComment]: `ASCII\0\0\0${userComment}`
      }
    : {}
  // exif main obj
  const exifObj = {
    ...existing_exif,
    '0th': existing_exif['0th']
      ? { ...existing_exif['0th'], ...zeroth }
      : zeroth,
    Exif: existing_exif.Exif ? { ...existing_exif.Exif, ...exif } : exif
  }
  return exifObj
}

function byteStringWithExifData(imageBytes: string, exif: any): string {
  const exifbytes = exifLib.dump(exif)
  const result = exifLib.insert(exifbytes, imageBytes)
  return result
}

async function addOrUpdateExifData(blob: Blob, userComment: string): Blob {
  const dataURI = await blobToBase64(blob)
  const new_exif = mergeExifData(getExifFromDataURI(dataURI), userComment)
  return dataURItoBlob(dataURI, new_exif)
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
