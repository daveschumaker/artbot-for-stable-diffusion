import Link from 'next/link'
import { CSSProperties } from 'react'
import styles from './component.module.css'

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

  let target = ''

  if (
    props.href &&
    props.href.indexOf('https://') === 0 &&
    props.href.indexOf('https://tinybots.net') !== 0
  ) {
    target = '_blank'
  }

  return (
    <Link
      className={styles.Linker}
      target={target}
      {...rest}
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        ...style
      }}
    />
  )
}

export default Linker
