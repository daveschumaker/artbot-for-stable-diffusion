import AppSettings from 'app/_data-models/AppSettings'
import { uuidv4 } from 'app/_utils/appUtils'

export const setUserId = () => {
  const artbot_uuid = AppSettings.get('artbot_uuid')

  if (artbot_uuid) {
    return
  }

  AppSettings.set('artbot_uuid', uuidv4())
}
