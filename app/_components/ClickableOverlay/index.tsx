import { OverlayComponentProps } from '_types/artbot'
import clsx from 'clsx'
import styles from './overlay.module.css'

export default function ClickableOverlay(props: OverlayComponentProps) {
  const { disableBackground = false, handleClose = () => {} } = props

  return (
    <div
      className={clsx(styles.ClickableOverlay, {
        [styles['overlay-no-background']]: disableBackground
      })}
      onClick={handleClose}
    />
  )
}
