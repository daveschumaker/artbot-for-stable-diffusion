import React from 'react'
import clsx from 'clsx'

const MaxWidth = ({
  children,
  className,
  maxWidth
}: {
  children: React.ReactNode
  className?: string
  maxWidth?: number
}) => {
  const classes = ['mb-2']

  if (maxWidth) {
    classes.push(`max-w-[${maxWidth}px]`)
  }

  classes.push('w-full')

  return (
    <div
      className={clsx(classes, className)}
      style={{ maxWidth: maxWidth ? `${maxWidth}px` : '100%' }}
    >
      {children}
    </div>
  )
}

export default MaxWidth
