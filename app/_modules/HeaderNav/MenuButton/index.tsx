'use client'

import { IconMenu } from '@tabler/icons-react'
import { setShowAppMenu } from 'store/appStore'
import styles from './menuButton.module.css'

export default function MenuButton() {
  return (
    <div className={styles.MenuButton} onClick={() => setShowAppMenu(true)}>
      <IconMenu size={28} stroke={1.5} />
    </div>
  )
}
