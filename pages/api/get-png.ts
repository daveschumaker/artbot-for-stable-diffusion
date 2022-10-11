import type { NextApiRequest, NextApiResponse } from 'next'
import sharp from 'sharp'

type Data = {
  success: boolean
  base64String?: string
}

const convertImage = (imgBuffer: any) => {
  return new Promise((resolve) => {
    return sharp(imgBuffer)
      .png()
      .toBuffer()
      .then(async function (data) {
        const pngString = await data.toString('base64')

        console.log(
          `${new Date().toLocaleString()}: Generating PNG for download.`
        )
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

  const { imgString } = req.body
  let imgBuffer = Buffer.from(imgString, 'base64')

  const converted = await convertImage(imgBuffer)

  // @ts-ignore
  const { success, base64String } = converted

  res.send({
    success,
    base64String
  })
}
