import { IconBellRinging2 } from '@tabler/icons-react'
import EscapedNavDropdown from '../EscapedNavDropdown'
import NotificationDropdown from '../NotificationDropdown'
import { useStore } from 'statery'
import { appInfoStore } from 'app/_store/appStore'
import { useEffect, useState } from 'react'
import AppSettings from 'app/_data-models/AppSettings'

export default function NotificationDisplay() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [validTimestamp, setValidTimestamp] = useState(false)

  const { notification = {} } = useStore(appInfoStore)
  // @ts-ignore
  const { title, content, timestamp } = notification

  useEffect(() => {
    const viewed = AppSettings.get('notification-viewed') || 0
    if (Number(viewed) < timestamp && !isLoaded) {
      setValidTimestamp(true)
      setIsLoaded(true)
    }
  }, [isLoaded, timestamp])

  if (!title || !content) {
    return null
  }

  if (!isLoaded || !validTimestamp) {
    return null
  }

  return (
    <EscapedNavDropdown
      menuIcon={<IconBellRinging2 stroke={1} size={28} />}
      content={<NotificationDropdown />}
    />
  )
}
