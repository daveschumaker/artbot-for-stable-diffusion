import { basePath } from 'BASE_PATH'
import AppSettings from 'app/_data-models/AppSettings'
import { setAuthToken } from 'app/_store/userStore'

export const loadAuthToken = async () => {
  const user_token = AppSettings.get('user_token')

  if (user_token) {
    const response = await fetch(`${basePath}/api/admin/login`, {
      method: 'POST',
      headers: {
        Authorization: user_token as string
      }
    })

    const { success } = await response.json()

    if (success) {
      setAuthToken(user_token)
    } else {
      AppSettings.set('user_token', '')
    }
  }
}
