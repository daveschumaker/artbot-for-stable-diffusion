import type { NextApiRequest, NextApiResponse } from 'next'
import sizeOf from 'buffer-image-size'
import sharp from 'sharp'
import ufs from 'app/_utils/server_fileSize'

const MAX_FILESIZE = 10 * 1000000

type Data = {
  success: boolean
  base64String?: string
  status?: string
}

const getDataUrl = async (imgBuffer: any) => {
  try {
    const { data, info } = await sharp(imgBuffer).toBuffer({
      resolveWithObject: true
    })
    const pngString = await data.toString('base64')

    return {
      success: true,
      base64String: pngString,
      height: info.height,
      width: info.width
    }
  } catch (err) {
    console.log(`Unable to create png file.`, err)
    return {
      success: false
    }
  }
}

const resizeImage = async (imgBuffer: any) => {
  try {
    const { data, info } = await sharp(imgBuffer)
      .resize({
        width: 1024,
        height: 1024,
        fit: 'inside'
      })
      .toBuffer({ resolveWithObject: true })
    const pngString = await data.toString('base64')

    return {
      success: true,
      base64String: pngString,
      height: info.height,
      width: info.width
    }
  } catch (err) {
    console.log(`Unable to create png file.`, err)
    return {
      success: false
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(400).json({ success: false })
  }

  const { imageUrl, r2 = false } = req.body

  try {
    const fileSize = await ufs(imageUrl)
    if (fileSize > MAX_FILESIZE) {
      return res.send({
        success: false,
        status: 'ERROR_IMAGE_SIZE'
      })
    }
  } catch (err) {
    return res.send({
      success: false,
      status: 'UNABLE_TO_GET_IMAGE_SIZE'
    })
  }

  const resp = await fetch(imageUrl)
  const imageType = resp.headers.get('Content-Type')

  let converted
  let imgBuffer

  try {
    // @ts-ignore
    const arrayBuffer = await resp.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    imgBuffer = Buffer.from(uint8Array)
  } catch (err) {
    console.log(`--`)
    console.log(new Date())
    console.log(`Error: resp.buffer is missing`)
    console.log(`Image URL:`, imageUrl)
    console.log(err)

    return res.send({
      success: false,
      status: 'ERROR_RESIZING_REMOTE_IMAGE'
    })
  }

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
