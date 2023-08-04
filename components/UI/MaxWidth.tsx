import clsx from 'clsx'
import React, { CSSProperties } from 'react'

const MaxWidth = ({
  children,
  className,
  style,
  width
}: {
  children: React.ReactNode
  className?: string
  style?: CSSProperties
  width?: string
}) => {
  return (
    <div
      className={clsx('w-full', className)}
      style={{ maxWidth: width ? `${width}` : '100%', ...style }}
    >
      {children}
    </div>
  )
}

export default MaxWidth
