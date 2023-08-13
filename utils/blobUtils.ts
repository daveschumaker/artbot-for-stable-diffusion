// @ts-nocheck
import piexif from 'piexifjs';

export const initBlob = () => {
  if (!Blob.prototype.toPNG) {
    Blob.prototype.toPNG = function (callback: any) {
      return convertBlob(this, 'image/png', callback)
    }
  }

  if (!Blob.prototype.toWebP) {
    Blob.prototype.toWebP = function (callback: any) {
      return convertBlob(this, 'image/webp', callback)
    }
  }

  if (!Blob.prototype.toJPEG) {
    Blob.prototype.toJPEG = function (callback: any, userComment: string) {
      return convertBlob(this, 'image/jpeg', callback, userComment)
    }
  }
}

function convertBlob(
  blob: Blob | MediaSource,
  type: string,
  callback: (arg0: Blob) => void,
  userComment: string,
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

  // Add exif data if filetype is jpeg, and userComment is set
  if (userComment && mimeString == "image/jpeg") {
    const exif = {[piexif.ExifIFD.UserComment]: `ASCII\0\0\0${userComment}`};
    const exifObj = {"Exif":exif};
    const exifbytes = piexif.dump(exifObj);
    byteString = piexif.insert(exifbytes, byteString)
  }

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
