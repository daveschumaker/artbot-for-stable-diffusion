'use client'

import { IconMenuDeep } from '@tabler/icons-react'
import { setShowAppMenu } from 'store/appStore'
import styles from './menuButton.module.css'

export default function MenuButton() {
  return (
    <div className={styles.MenuButton} onClick={() => setShowAppMenu(true)}>
      <IconMenuDeep size={28} stroke={2} />
    </div>
  )
}
