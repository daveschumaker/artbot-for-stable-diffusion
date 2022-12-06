import type { NextApiRequest, NextApiResponse } from 'next'
import sharp from 'sharp'

type Data = {
  success: boolean
  base64String?: string
  status?: string
}

const getDataUrl = (imgBuffer: any) => {
  return new Promise((resolve) => {
    return sharp(imgBuffer)
      .toBuffer({ resolveWithObject: true })
      .then(async function ({ data, info }) {
        const pngString = await data.toString('base64')
        resolve({
          success: true,
          base64String: pngString,
          height: info.height,
          width: info.width
        })
      })
      .catch((err) => {
        console.log(`Unable to create png file.`, err)
        resolve({
          success: false
        })
      })
  })
}

const resizeImage = (imgBuffer: any) => {
  return new Promise((resolve) => {
    return sharp(imgBuffer)
      .resize({
        width: 1024,
        height: 1024,
        fit: 'inside'
      })
      .toBuffer({ resolveWithObject: true })
      .then(async function ({ data, info }) {
        const pngString = await data.toString('base64')
        resolve({
          success: true,
          base64String: pngString,
          height: info.height,
          width: info.width
        })
      })
      .catch((err) => {
        console.log(`Unable to create png file.`, err)
        resolve({
          success: false
        })
      })
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(400).json({ success: false })
  }

  const { imageUrl, r2 = false } = req.body

  const resp = await fetch(imageUrl)
  const imageType = resp.headers.get('Content-Type')

  let converted

  // @ts-ignore
  const imgBuffer = await resp.buffer()

  if (!r2) {
    converted = await resizeImage(imgBuffer)
  } else {
    converted = await getDataUrl(imgBuffer)
  }

  // @ts-ignore
  const { success, base64String, height, width } = converted

  if (success) {
    return res.send({
      success,
      // @ts-ignore
      imageType,
      imgBase64String: base64String,
      height,
      width
    })
  } else {
    res.send({
      success: false,
      status: 'ERROR_RESIZING_REMOTE_IMAGE'
    })
  }
}
