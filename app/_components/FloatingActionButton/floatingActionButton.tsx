import React from 'react'
import styles from './floatingActionButton.module.css'

const FloatingActionButton = ({
  children,
  onClick = () => {}
}: {
  children: React.ReactNode
  onClick: () => void
}) => {
  return (
    <div className={styles['fab-wrapper-group']}>
      <div className={styles['fab-wrapper']} onClick={onClick}>
        {children}
      </div>
    </div>
  )
}

export default FloatingActionButton
