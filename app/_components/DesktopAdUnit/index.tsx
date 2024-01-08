import AdContainer from 'app/_components/AdContainer'
import styles from './desktopAdUnit.module.css'

export default function DesktopAdUnit() {
  return (
    <div
      id="ad-container"
      className={styles.desktopAdUnit}
      style={{ minWidth: '154px', width: '154px' }}
    >
      <AdContainer
        style={{
          position: 'fixed',
          top: '58px',
          maxWidth: '154px'
        }}
      />
    </div>
  )
}
