import clsx from 'clsx'
import React from 'react'
import Overlay from '../../UI/Overlay'
import styles from './dropdown.module.css'

const DropDown = ({
  alignRight = false,
  children,
  className,
  handleClose = () => {},
  style = {}
}: {
  alignRight?: boolean
  children: React.ReactNode
  className?: string
  handleClose(): void
  style?: any
}) => {
  const classes = [styles.dropdown]

  if (alignRight) {
    classes.push(styles['align-right'])
  } else {
    classes.push(styles['align-left'])
  }

  return (
    <>
      <Overlay disableBackground handleClose={handleClose} />
      <div className={clsx(classes, className)} style={{ ...style }}>
        {children}
      </div>
    </>
  )
}

export default DropDown
