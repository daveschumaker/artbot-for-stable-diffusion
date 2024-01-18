import { clientHeader, getApiHostServer } from 'app/_utils/appUtils'

export default async function download(jobId: string) {
  try {
    const res = await fetch(
      `${getApiHostServer()}/api/v2/generate/status/${jobId}`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader()
        }
      }
    )

    const data = await res.json()
    return data
  } catch (err) {
    console.log(`Error: Unable to download images for jobId: ${jobId}`)
    console.log(err)
  }
}
