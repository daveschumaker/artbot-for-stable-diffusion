import clsx from 'clsx'
import styles from './overlay.module.css'
import { CSSProperties } from 'react'

export interface IOverlayProps {
  className?: string
  blurBackground?: boolean
  disableBackground?: boolean
  handleClose?: () => void
  zIndex?: number
}

const Overlay = (props: IOverlayProps) => {
  const {
    className,
    blurBackground = false,
    disableBackground = false,
    handleClose = () => {},
    zIndex = 'var(--zIndex-overNavBar)'
  } = props

  const style: CSSProperties = {
    zIndex
  }

  if (disableBackground) {
    style.backgroundColor = 'unset'
  }

  return (
    <div
      className={clsx(
        styles.Overlay,
        blurBackground && styles.OverlayBlurBackground,
        className
      )}
      onClick={handleClose}
      style={{ ...style }}
    />
  )
}

export default Overlay
