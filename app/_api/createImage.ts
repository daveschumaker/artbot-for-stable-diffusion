import AppSettings from 'app/_data-models/AppSettings'
import ImageParamsForApi, {
  IArtBotImageDetails
} from 'app/_data-models/ImageParamsForApi'
import { GenerateResponse } from '_types'
import { clientHeader, getApiHostServer } from 'app/_utils/appUtils'
import { trackEvent } from './telemetry'

interface CreateImageResponse {
  statusCode?: number
  success: boolean
  jobId?: string
  status?: string
  message?: string
  kudos?: number
}

let isPending = false

export const createImage = async (
  imageDetails: IArtBotImageDetails
): Promise<CreateImageResponse> => {
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

  isPending = true
  const imageParams = new ImageParamsForApi(imageDetails)

  try {
    const resp = await fetch(`${getApiHostServer()}/api/v2/generate/async`, {
      method: 'POST',
      body: JSON.stringify(imageParams),
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': clientHeader(),
        apikey: apikey
      }
    })

    const statusCode = resp.status
    const data = await resp.json()
    const { id, message = '', kudos }: GenerateResponse = data
    isPending = false

    if (imageDetails.dry_run && kudos) {
      return {
        success: true,
        kudos
      }
    }

    if (message.indexOf('unethical images') >= 0) {
      return {
        success: false,
        status: 'QUESTIONABLE_PROMPT_ERROR',
        message
      }
    }

    if (
      message === 'Only Trusted users are allowed to perform this operation'
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      trackEvent({
        event: 'ERROR',
        action: 'UNTRUSTED_IP',
        context: 'createImageApi',
        data: {
          imageParams: {
            ...new ImageParamsForApi(imageDetails, { hasError: true })
          }
        }
      })
      return {
        success: false,
        status: 'UNTRUSTED_IP',
        message:
          'Cannot send requests from an IP address behind a VPN or Private Relay. Please disable and try again.'
      }
    }

    if (statusCode === 400) {
      trackEvent({
        event: 'ERROR',
        action: 'INVALID_PARAMS',
        context: 'createImageApi',
        data: {
          imageParams: {
            ...new ImageParamsForApi(imageDetails, { hasError: true })
          },
          message,
          statusCode
        }
      })
      return {
        statusCode,
        success: false,
        status: 'INVALID_PARAMS',
        message
      }
    }

    if (statusCode === 401) {
      trackEvent({
        event: 'ERROR',
        action: 'INVALID_API_KEY',
        context: 'createImageApi',
        data: {
          imageParams: {
            ...new ImageParamsForApi(imageDetails, { hasError: true })
          },
          message,
          statusCode
        }
      })
      return {
        statusCode,
        success: false,
        status: 'INVALID_API_KEY',
        message
      }
    }

    if (statusCode === 403) {
      trackEvent({
        event: 'ERROR',
        action: 'FORBIDDEN_REQUEST',
        context: 'createImageApi',
        data: {
          imageParams: {
            ...new ImageParamsForApi(imageDetails, { hasError: true })
          },
          message,
          statusCode
        }
      })
      return {
        statusCode,
        success: false,
        status: 'FORBIDDEN_REQUEST',
        message
      }
    }

    if (statusCode === 429) {
      return {
        statusCode,
        success: false,
        status: 'MAX_REQUEST_LIMIT',
        message
      }
    }

    if (statusCode === 503) {
      return {
        statusCode,
        success: false,
        status: 'HORDE_OFFLINE',
        message
      }
    }

    if (!id) {
      return {
        statusCode,
        success: false,
        message,
        status: 'MISSING_JOB_ID'
      }
    }

    return {
      success: true,
      jobId: id
    }
  } catch (err) {
    isPending = false

    // Handles weird issue where Safari encodes API key using unicode text.
    if (
      //@ts-ignore
      err.name === 'TypeError' &&
      //@ts-ignore
      err.message.indexOf(`Header 'apikey' has invalid value`) >= 0
    ) {
      trackEvent({
        event: 'ERROR',
        action: 'API_KEY_ERROR',
        content: 'createImageApi'
      })
      return {
        success: false,
        status: 'API_KEY_ERROR',
        message:
          'Character encoding issue with apikey. Please go to settings page to clear and re-renter your API key.'
      }
    }

    trackEvent({
      event: 'UNKNOWN_ERROR',
      content: 'createImageApi',
      data: {
        imageParams: {
          ...new ImageParamsForApi(imageDetails, { hasError: true })
        },
        // @ts-ignore
        errMsg: err?.message || ''
      }
    })

    console.log(`--- createImage: Unknown Error ---`)
    console.log(err)

    return {
      success: false,
      status: 'UNKNOWN_ERROR',
      message: 'Unable to create image. Please try again soon.'
    }
  }
}
