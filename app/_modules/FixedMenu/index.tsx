'use client'

import { useRouter } from 'next/navigation'
import MenuOptions from '../MenuOptions'
import styles from './fixedMenu.module.css'

export default function FixedMenu() {
  const router = useRouter()

  const navigateToLink = (path: string) => {
    router.push(path)
  }

  return (
    <div className={styles.FixedMenu}>
      <MenuOptions
        navigateToLink={navigateToLink}
        style={{ marginTop: '8px', width: 'var(--fixedSideBar-width)' }}
      />
    </div>
  )
}
