import type { NextApiRequest, NextApiResponse } from 'next'
import sharp from 'sharp'

type Data = {
  success: boolean
  base64String?: string
  status?: string
}

const resizeImage = (imgBuffer: any) => {
  return new Promise((resolve) => {
    return sharp(imgBuffer)
      .resize({
        width: 1024,
        height: 1024,
        fit: 'inside'
      })
      .toBuffer()
      .then(async function (data) {
        const pngString = await data.toString('base64')

        console.log(`${new Date().toLocaleString()}: Resizing image.`)
        resolve({
          success: true,
          base64String: pngString
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

  const { imageUrl } = req.body

  const resp = await fetch(imageUrl)
  const imageType = resp.headers.get('Content-Type')

  // @ts-ignore
  const imgBuffer = await resp.buffer()
  const converted = await resizeImage(imgBuffer)

  // @ts-ignore
  const { success, base64String } = converted

  if (success) {
    return res.send({
      success,
      // @ts-ignore
      imageType,
      imgBase64String: base64String
    })
  } else {
    res.send({
      success: false,
      status: 'ERROR_RESIZING_REMOTE_IMAGE'
    })
  }
}
