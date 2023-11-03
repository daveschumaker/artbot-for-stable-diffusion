import clsx from 'clsx'
import styles from './overlay.module.css'
import { CSSProperties } from 'react'

export interface IOverlayProps {
  className?: string
  blurBackground?: boolean
  disableBackground?: boolean
  handleClose?: () => void
  style?: CSSProperties
  zIndex?: number
}

const Overlay = (props: IOverlayProps) => {
  const {
    className,
    blurBackground = false,
    disableBackground = false,
    handleClose = () => {},
    style = {},
    zIndex = 'var(--zIndex-overNavBar)'
  } = props

  const styleProps: CSSProperties = {
    zIndex,
    ...style
  }

  if (disableBackground) {
    styleProps.backgroundColor = 'unset'
  }

  return (
    <div
      className={clsx(
        styles.Overlay,
        blurBackground && styles.OverlayBlurBackground,
        className
      )}
      onClick={handleClose}
      style={{ ...styleProps }}
    />
  )
}

export default Overlay
