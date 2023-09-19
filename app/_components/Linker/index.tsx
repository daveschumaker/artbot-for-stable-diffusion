import Link from 'next/link'
import styles from './component.module.css'
import { CSSProperties } from 'react'

const Linker = (props: any) => {
  const {
    disableLinkClick = false,
    inline,
    onClick = () => {},
    ...rest
  } = props

  const handleClick = (e: any) => {
    // Handle scenario where we want to have a link available for middle click / open new tab,
    // but we want the normal left click event to do something else.
    if (disableLinkClick) {
      e.preventDefault()
      e.stopPropagation()
    }

    onClick()
  }

  const style: CSSProperties = {}

  if (inline) {
    style.display = 'inline-block'
  }

  return (
    <Link
      className={styles.Linker}
      {...rest}
      onClick={handleClick}
      style={style}
    />
  )
}

export default Linker
