import * as React from 'react'

import { Tooltip as ReactTooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import styles from './tooltip.module.css'

interface TooltipProps {
  children: React.ReactNode
  disabled?: boolean
  targetId: string
  width?: string
}

export default function Tooltip({
  children,
  disabled = false,
  targetId,
  width
}: TooltipProps) {
  if (disabled) {
    return null
  }

  const style = {}

  if (width) {
    // @ts-ignore
    style.width = width
  }

  return (
    <ReactTooltip
      anchorSelect={`#${targetId}`}
      className={styles['tooltip-wrapper']}
      place="bottom"
      style={{ ...style }}
    >
      <div className={styles['tooltip']}>{children}</div>
    </ReactTooltip>
  )
}
