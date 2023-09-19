import React from 'react'

interface IRowProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

const Row = (props: IRowProps) => {
  const { children, ...rest } = props
  return (
    <div className={`flex flex-row w-full gap-[8px] items-center`} {...rest}>
      {children}
    </div>
  )
}

export default Row
