import AppSettings from 'app/_data-models/AppSettings'
import { clientHeader, getApiHostServer } from 'app/_utils/appUtils'

interface IParams {
  interrogationTypes: Array<any>
  source_image: string
}

let isPending = false

export const requestIterrogate = async ({
  interrogationTypes = [],
  source_image = ''
}: IParams) => {
  const apikey = AppSettings.get('apiKey')?.trim() || '0000000000'

  if (!apikey) {
    return {
      success: false,
      status: 'MISSING_API_KEY',
      message: 'Incorrect API key'
    }
  }

  if (isPending) {
    return {
      success: false,
      status: 'WAITING_FOR_PENDING_JOB',
      message: 'Waiting for pending request to finish.'
    }
  }

  const apiParams = {
    forms: [...interrogationTypes],
    source_image
  }

  try {
    isPending = true
    const resp = await fetch(`${getApiHostServer()}/api/v2/interrogate/async`, {
      method: 'POST',
      body: JSON.stringify(apiParams),
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': clientHeader(),
        apikey: apikey
      }
    })

    const statusCode = resp.status
    const data = await resp.json()
    const { id }: { id: string } = data
    isPending = false

    if (statusCode === 400) {
      return {
        success: false,
        message: data.message,
        status: 'BAD_REQUEST'
      }
    }

    if (data.message) {
      return {
        success: false,
        message: data.message
      }
    }

    return {
      success: true,
      jobId: id
    }
  } catch (err) {
    isPending = false

    return {
      success: false,
      status: 'UNKNOWN_ERROR',
      message: 'Unable to create image. Please try again soon.'
    }
  }
}
