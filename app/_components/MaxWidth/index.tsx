import { CSSProperties, ReactNode } from 'react'
import styles from './maxWidth.module.css'

const MaxWidth = ({
  children,
  max,
  style
}: {
  children: ReactNode
  max?: string
  style?: CSSProperties
}) => {
  const stylesObj = { ...style }

  if (max) {
    stylesObj.maxWidth = max
  }

  return (
    <div className={styles.MaxWidth} style={stylesObj}>
      {children}
    </div>
  )
}

export default MaxWidth
