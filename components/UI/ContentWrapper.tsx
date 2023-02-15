import React from 'react'
import clsx from 'clsx'

const Content = ({ children }: { children: React.ReactNode }) => {
  const classes = [
    'flex',
    'flex-col',
    'justify-start',
    'pt-[8px]',
    'relative',
    'w-[calc(100%-16px)]',
    'sm:max-w-[768px]',
    'xl:max-w-[1024px]',
    '2xl:max-w-[1280px]'
  ]
  return <div className={clsx(classes)}>{children}</div>
}

export default Content
