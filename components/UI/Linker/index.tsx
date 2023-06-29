import Link from 'next/link'
import styles from './component.module.css'

const Linker = (props: any) => {
  const { disableLinkClick = false, onClick = () => {}, ...rest } = props

  const handleClick = (e: any) => {
    // Handle scenario where we want to have a link available for middle click / open new tab,
    // but we want the normal left click event to do something else.
    if (disableLinkClick) {
      e.preventDefault()
      e.stopPropagation()
    }

    onClick()
  }

  return <Link className={styles.Linker} {...rest} onClick={handleClick} />
}

export default Linker
