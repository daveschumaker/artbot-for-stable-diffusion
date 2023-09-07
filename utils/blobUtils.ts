// @ts-nocheck
import * as exifLib from '@asc0910/exif-library'

export const initBlob = () => {
  if (!Blob.prototype.toPNG) {
    Blob.prototype.toPNG = function (callback: any, userComment: string) {
      return convertBlob(this, 'image/png', callback, userComment)
    }
  }

  if (!Blob.prototype.toWebP) {
    Blob.prototype.toWebP = function (callback: any, userComment: string) {
      return convertBlob(this, 'image/webp', callback, userComment)
    }
  }

  if (!Blob.prototype.toJPEG) {
    Blob.prototype.toJPEG = function (callback: any, userComment: string) {
      return convertBlob(this, 'image/jpeg', callback, userComment)
    }
  }

  if (!Blob.prototype.addOrUpdateExifData) {
    Blob.prototype.addOrUpdateExifData = function (userComment: string): Blob {
      return addOrUpdateExifData(this, userComment)
    }
  }
}

function convertBlob(
  blob: Blob | MediaSource,
  type: string,
  callback: (arg0: Blob) => void,
  userComment: string
) {
  return new Promise((resolve) => {
    let canvas = <HTMLCanvasElement>createTempCanvas()
    let ctx = canvas.getContext('2d')
    let image = new Image()
    image.src = URL.createObjectURL(blob)
    image.onload = function () {
      canvas.width = image.width
      canvas.height = image.height
      ctx.drawImage(image, 0, 0)
      let result = dataURItoBlob(canvas.toDataURL(type, 1), userComment)
      if (callback) callback(result)
      else resolve(result)
    }
  })
}

function dataURItoBlob(dataURI: string, userComment: string) {
  var byteString = atob(dataURI.split(',')[1])
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  byteString = byteStringWithExifData(dataURI, byteString, userComment) // insert exif data

  var ab = new ArrayBuffer(byteString.length)
  var ia = new Uint8Array(ab)
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  var blob = new Blob([ab], { type: mimeString })
  return blob
}

function createTempCanvas() {
  let canvas = document.createElement('CANVAS')
  canvas.style.display = 'none'
  return canvas
}

function byteStringWithExifData(
  dataURI: string,
  byteString: string,
  userComment: string
) {
  let existing_exif = {}
  try {
    existing_exif = exifLib.load(dataURI)
  } catch (e) {}

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
  const exifbytes = exifLib.dump(exifObj)
  byteString = exifLib.insert(exifbytes, byteString)
  return byteString
}

async function addOrUpdateExifData(blob: Blob, userComment: string) {
  const dataURI = await blobToBase64(blob)
  const newBlob = dataURItoBlob(dataURI, userComment)
  return newBlob
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
