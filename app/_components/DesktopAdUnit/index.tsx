'use client'

import AdContainer from 'app/_components/AdContainer'
import styles from './desktopAdUnit.module.css'
import { useWindowSize } from 'app/_hooks/useWindowSize'

export default function DesktopAdUnit() {
  const { width } = useWindowSize()

  return (
    <div
      id="ad-container"
      className={styles.desktopAdUnit}
      style={{ minWidth: '154px', width: '154px' }}
    >
      {width && width >= 640 && (
        <AdContainer
          style={{
            position: 'fixed',
            top: '58px',
            maxWidth: '154px'
          }}
        />
      )}
    </div>
  )
}
