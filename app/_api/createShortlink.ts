import { basePath } from 'BASE_PATH'

export const createShortlink = async (obj: any = {}) => {
  try {
    const res = await fetch(`${basePath}/api/create-shortlink`, {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const shortlinkData = await res.json()

    return shortlinkData
  } catch (err) {
    console.log(`Error: Unable to create shortlink`)
    console.log(err)
    return {
      success: false
    }
  }
}
