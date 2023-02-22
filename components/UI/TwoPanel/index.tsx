import clsx from 'clsx'
import React from 'react'
import styles from './twopanel.module.css'

const TwoPanel = ({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) => {
  return <div className={clsx(styles['two-panel'], className)}>{children}</div>
}

export default TwoPanel
