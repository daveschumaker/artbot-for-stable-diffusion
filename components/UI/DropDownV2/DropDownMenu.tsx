import clsx from 'clsx'
import React from 'react'
import Overlay from '../../UI/Overlay'

const DropDown = ({
  children,
  handleClose = () => {}
}: {
  children: React.ReactNode
  handleClose(): void
}) => {
  return (
    <>
      <Overlay disableBackground handleClose={handleClose} />
      <div
        className={clsx([
          'border-[1px]',
          'border-slate-500',
          'flex',
          'flex-col',
          'items-center',
          'bg-[#ffffff]',
          `rounded-[4px]`,
          'absolute',
          'mb-[8px]',
          // 'gap-[2px]',
          'justify-between',
          'p-[8px]',
          'shadow-md',
          'z-30',
          'top-[42px]',
          'md:top-[22px]',
          'left-0',
          'min-w-[200px]'
        ])}
      >
        {children}
      </div>
    </>
  )
}

export default DropDown
