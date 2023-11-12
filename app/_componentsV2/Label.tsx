import React from 'react'
import { Tooltip } from './Tooltip'
import clsx from 'clsx'

interface LabelProps {
  className?: string
  text: React.ReactNode | string
  tooltipTitle?: React.ReactNode | string
  tooltip?: React.ReactNode | string
}
export function Label({ className, text, tooltip, tooltipTitle }: LabelProps) {
  return (
    <label
      className={clsx(
        'flex flex-row gap-1 items-center text-left text-sm font-[600] w-full',
        className
      )}
    >
      {text}
      {tooltip && <Tooltip text={tooltip} title={tooltipTitle} />}
    </label>
  )
}
