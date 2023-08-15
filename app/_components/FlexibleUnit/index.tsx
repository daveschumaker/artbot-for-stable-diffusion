import clsx from 'clsx'
import { CSSProperties, ReactNode } from 'react'
import styles from './flexibleUnit.module.css'

export default function FlexibleUnit({
  children,
  className,
  style
}: {
  children?: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      className={clsx(styles.flexibleUnit, className)}
      style={Object.assign({}, style)}
    >
      {children}
    </div>
  )
}
