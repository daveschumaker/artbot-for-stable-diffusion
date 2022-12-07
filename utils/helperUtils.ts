export const formatSeconds = (time: number) => {
  time = Number(time)

  if (time === 0) {
    return '0s'
  }

  const d = Math.floor(time / 86400)
  const h = Math.floor((time % 86400) / 3600)
  const m = Math.floor(((time % 86400) % 3600) / 60)

  const days = d > 0 ? d + 'd ' : ''
  const hours = h > 0 ? h + 'h ' : ''
  const mins = m > 0 ? m + 'm ' : ''

  return days + hours + mins
}

export const randomPropertyName = function (obj: any = {}) {
  const keys = Object.keys(obj)
  return keys[Math.floor(Math.random() * keys.length)]
}

export const toBool = (value?: string | null) => {
  if (value === 'true' || value === 'True') {
    return true
  } else {
    return false
  }
}

export const blobToBase64 = (blob: any) => {
  return new Promise((resolve) => {
    var reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = function () {
      var base64data = reader.result
      resolve(base64data)
    }
  })
}
