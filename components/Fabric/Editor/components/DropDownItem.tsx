import React from 'react'

const DropDownItem = ({
  children,
  handleClick = () => {}
}: {
  children: React.ReactNode
  handleClick?: () => void
}) => {
  const classes = [
    'flex',
    'flex-row',
    'gap-2',
    'items-center',
    'cursor-pointer',
    'hover:bg-[#f3f3f3]',
    'active:bg-[#f3f3f3]',
    'text-neutral-900',
    'w-full',
    'px-2',
    'py-[4px]',
    'text-sm',
    'rounded-md'
  ]
  return (
    <div className={classes.join(' ')} onClick={handleClick}>
      {children}
    </div>
  )
}

export default DropDownItem
