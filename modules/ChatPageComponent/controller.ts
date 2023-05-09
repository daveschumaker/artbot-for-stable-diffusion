import AppSettings from 'models/AppSettings'
import { clientHeader } from 'utils/appUtils'

export const checkTextJobStatus = async (jobId: string) => {
  try {
    const res = await fetch(
      `https://horde.koboldai.net/api/v2/generate/text/status/${jobId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader()
        }
      }
    )

    const data = res.json()
    return data
  } catch (err) {}
}

export const createTextJob = async (payload: object) => {
  try {
    const res = await fetch(
      'https://horde.koboldai.net/api/v2/generate/text/async',
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader(),
          apikey: AppSettings.get('apikey') || '0000000000'
        }
      }
    )

    const data = res.json()

    return data
  } catch (err) {}
}

export const fetchTextModels = async () => {
  try {
    const res = await fetch(
      'https://aihorde.net/api/v2/status/models?type=text'
    )
    const data = res.json()

    return data
  } catch (err) {
    console.log(`Error: Unable to fetch text models.`)
    return []
  }
}
