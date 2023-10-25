import { CSSProperties, ReactNode } from 'react'
import styles from './maxWidth.module.css'
import clsx from 'clsx'

const MaxWidth = ({
  className,
  children,
  justify,
  margin,
  max,
  style
}: {
  className?: string
  children: ReactNode
  margin?: string
  max?: string
  justify?: string
  style?: CSSProperties
}) => {
  const stylesObj = { ...style }

  if (justify) {
    stylesObj.justifyContent = justify
  }

  if (margin) {
    stylesObj.margin = margin
  }

  if (max) {
    stylesObj.maxWidth = max
  }

  return (
    <div className={clsx(className, styles.MaxWidth)} style={stylesObj}>
      {children}
    </div>
  )
}

export default MaxWidth
