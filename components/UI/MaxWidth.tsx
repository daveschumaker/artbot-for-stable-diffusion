import clsx from 'clsx'
import React from 'react'

const MaxWidth = ({
  children,
  className,
  width
}: {
  children: React.ReactNode
  className?: string
  width?: string
}) => {
  return (
    <div
      className={clsx('w-full', className)}
      style={{ maxWidth: width ? `${width}` : '100%' }}
    >
      {children}
    </div>
  )
}

export default MaxWidth
