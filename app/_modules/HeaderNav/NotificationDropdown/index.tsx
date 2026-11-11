import DOMPurify from 'isomorphic-dompurify'
import { useStore } from 'statery'
import styles from './component.module.css'
import { appInfoStore } from 'app/_store/appStore'
import { useEffect, useRef, useState } from 'react'
import AppSettings from 'app/_data-models/AppSettings'

type AppNotification = (typeof appInfoStore.state)['notification']

export default function NotificationDropdown({
  handleViewed
}: {
  handleViewed(): any
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(0)

  const { notification = {} as Partial<AppNotification> } =
    useStore(appInfoStore)
  const { title, content, timestamp } = notification

  useEffect(() => {
    if (contentRef.current) {
      setContainerHeight(contentRef.current.scrollHeight)
    }
  }, [contentRef])

  useEffect(() => {
    AppSettings.set('notification-viewed', Date.now())
    handleViewed()
  }, [handleViewed])

  return (
    <div
      className={styles.NotificationDropdown}
      style={{ height: containerHeight + 16, padding: '8px' }}
    >
      <div className="font-mono text-[14px]" ref={contentRef}>
        <div className="font-[700] pb-1">{title}</div>
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(content ?? '')
          }}
        />
        <div style={{ fontSize: '12px', paddingTop: '8px' }}>
          Posted {new Date(timestamp ?? NaN).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
