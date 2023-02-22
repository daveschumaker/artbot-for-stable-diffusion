import React from 'react'
import styles from './section.module.css'

const Section = ({
  first = false,
  children
}: {
  first?: boolean
  children?: React.ReactNode
}) => {
  return (
    <div className={first ? styles['section-first'] : styles['section']}>
      {children}
    </div>
  )
}

export default Section
