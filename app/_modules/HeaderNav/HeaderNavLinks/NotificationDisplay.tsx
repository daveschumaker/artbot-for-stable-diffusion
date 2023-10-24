import { IconBellRinging2 } from '@tabler/icons-react'
import EscapedNavDropdown from '../EscapedNavDropdown'
import NotificationDropdown from '../NotificationDropdown'
import { useStore } from 'statery'
import { appInfoStore } from 'app/_store/appStore'
import { useEffect, useState } from 'react'
import AppSettings from 'app/_data-models/AppSettings'
import { usePathname } from 'next/navigation'

export default function NotificationDisplay() {
  const pathname = usePathname()
  const [isLoaded, setIsLoaded] = useState(false)

  const { notification = {} } = useStore(appInfoStore)
  // @ts-ignore
  const { title, content, timestamp = 0 } = notification
  const [viewed, setViewed] = useState(true)

  const handleViewed = () => {
    setViewed(true)
  }

  useEffect(() => {
    const viewedTimestamp = AppSettings.get('notification-viewed') || 0
    if (timestamp && Number(viewedTimestamp) < timestamp) {
      setViewed(false)
    } else if (timestamp) {
      handleViewed()
    }
    setIsLoaded(true)
  }, [timestamp])

  if (!title || !content) {
    return null
  }

  if (!isLoaded) {
    return null
  }

  if (pathname === '/') {
    return null
  }

  return (
    <EscapedNavDropdown
      menuIcon={
        <div>
          <IconBellRinging2
            color={!viewed ? 'var(--main-color)' : 'var(--input-color)'}
            stroke={1}
            size={28}
          />
        </div>
      }
      content={<NotificationDropdown handleViewed={handleViewed} />}
    />
  )
}
