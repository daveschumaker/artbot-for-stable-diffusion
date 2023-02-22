import clsx from 'clsx'
import React from 'react'
import styles from './splitpanel.module.css'

const SplitPanel = ({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div className={clsx(styles['split-panel'], className)}>{children}</div>
  )
}

export default SplitPanel
