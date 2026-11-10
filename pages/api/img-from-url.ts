import type { NextApiRequest, NextApiResponse } from 'next'
import sizeOf from 'buffer-image-size'
import sharp from 'sharp'
import {
  fetchRemoteImage,
  RemoteImageError
} from 'app/_server-api/fetchRemoteImage'

const MAX_FILESIZE = 10 * 1000000

type Data = {
  success: boolean
  base64String?: string
  status?: string
  imageType?: string | null
  imgBase64String?: string
  height?: number
  width?: number
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

const fetchErrorStatus = (err: unknown) => {
  const code = err instanceof RemoteImageError ? err.code : 'FETCH_FAILED'

  if (code === 'TOO_LARGE') return 'ERROR_IMAGE_SIZE'
  if (code === 'FETCH_FAILED') return 'UNABLE_TO_FETCH_IMAGE'
  return 'INVALID_IMAGE_URL'
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(400).json({ success: false })
  }

  const { imageUrl, r2 = false } = req.body

  let imgBuffer: Buffer
  let imageType: string | null

  try {
    const remoteImage = await fetchRemoteImage(imageUrl, {
      maxBytes: MAX_FILESIZE
    })
    imgBuffer = remoteImage.body
    imageType = remoteImage.contentType
  } catch (err) {
    return res.send({ success: false, status: fetchErrorStatus(err) })
  }

  let converted

  try {
    const dimensions = sizeOf(imgBuffer)
    const shouldResize = dimensions.height > 1024 || dimensions.width > 1024

    if (!r2 && shouldResize) {
      converted = await resizeImage(imgBuffer)
    } else {
      converted = await getDataUrl(imgBuffer)
    }
  } catch (err) {
    return res.send({
      success: false,
      status: 'ERROR_RESIZING_REMOTE_IMAGE'
    })
  }

  const { success, base64String, height, width } = converted

  if (success) {
    return res.send({
      success,
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
