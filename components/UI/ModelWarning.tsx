import clsx from 'clsx'
import React from 'react'

const ModelWarning = ({ children }: { children: React.ReactNode }) => {
  const classes = [
    'flex-row',
    'flex',
    'font-[700]',
    'gap-[4px]',
    'h-[32px]',
    'items-center',
    'mb-[4px]',
    'mt-[4px]',
    'text-[#facc15]',
    'text-[14px]'
  ]
  return <div className={clsx(classes)}>{children}</div>
}

export default ModelWarning
