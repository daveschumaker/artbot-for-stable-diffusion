import AppSettings from 'app/_data-models/AppSettings'
import ImageParamsForApi from 'app/_data-models/ImageParamsForApi'
import { clientHeader, getApiHostServer } from 'app/_utils/appUtils'

export interface GenerateSuccessResponse {
  success: boolean
  id: string
  kudos: number
}

export interface GenerateErrorResponse {
  success: boolean
  statusCode: number
  message: string
}

interface HordeSuccessResponse {
  id: string
  kudos: number
}

interface HordeErrorResponse {
  message: string
}

export default async function generate(
  imageParams: ImageParamsForApi
): Promise<GenerateSuccessResponse | GenerateErrorResponse> {
  let statusCode
  try {
    const apikey = AppSettings.get('apiKey')?.trim() || '0000000000'
    const res = await fetch(`${getApiHostServer()}/api/v2/generate/async`, {
      body: JSON.stringify(imageParams),
      cache: 'no-store',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': clientHeader(),
        apikey: apikey
      }
    })

    statusCode = res.status
    const data: HordeSuccessResponse | HordeErrorResponse = await res.json()

    if ('id' in data) {
      return {
        success: true,
        ...data
      }
    } else {
      return {
        success: false,
        statusCode,
        message: data.message
      }
    }
  } catch (err) {
    console.log(`Error: Unable to send generate image request.`)
    console.log(err)

    return {
      success: false,
      statusCode: statusCode ?? 0,
      message: 'unknown error'
    }
  }
}
