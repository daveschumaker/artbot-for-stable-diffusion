import { fetchUserDetails } from 'api/userInfo'
import AppSettings from 'models/AppSettings'
import { setLoggedInState } from 'store/userStore'

export const handleApiKeyLogin = async (apikey: string) => {
  if (!apikey) {
    return { success: false }
  }
  try {
    const data = await fetchUserDetails(apikey)
    const { success } = data

    if (success) {
      AppSettings.save('apiKey', apikey)
      setLoggedInState(true)
      return { success: true }
    }

    return { success: false }
  } catch (e) {
    console.log(`Unable to load API key`, e)
    return { success: false }
  }
}
