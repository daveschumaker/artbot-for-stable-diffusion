import type { NextApiRequest, NextApiResponse } from 'next'
import sizeOf from 'buffer-image-size'
import sharp from 'sharp'
import ufs from '../../server/utils/fileSize'

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

  const fileSize = await ufs(imageUrl)

  if (fileSize > 10000000) {
    return res.send({
      success: false,
      status: 'ERROR_IMAGE_SIZE'
    })
  }

  const resp = await fetch(imageUrl)
  const imageType = resp.headers.get('Content-Type')

  let converted

  // @ts-ignore
  const imgBuffer = await resp.buffer()

  var dimensions = sizeOf(imgBuffer)
  const shouldResize = dimensions.height > 1024 || dimensions.width > 1024

  if (!r2 && shouldResize) {
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
