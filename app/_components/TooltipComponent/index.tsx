import React from 'react'
import InfoIcon from 'components/icons/InfoIcon'

import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import styles from './tooltip.module.css'

interface TooltipProps {
  children: React.ReactNode
  disabled?: boolean
  hideIcon?: boolean
  tooltipId: string
}

export default function TooltipComponent({
  children,
  disabled,
  hideIcon = false,
  tooltipId
}: TooltipProps) {
  if (disabled) return null

  return (
    <div className="text-sm font-normal ml-[4px]">
      {!hideIcon && (
        <a id={tooltipId}>
          <InfoIcon stroke="white" fill="#14B8A6" />
        </a>
      )}
      <Tooltip
        anchorSelect={`#${tooltipId}`}
        className={styles['tooltip-wrapper']}
        place="bottom"
      >
        <div className={styles.tooltip}>{children}</div>
      </Tooltip>
    </div>
  )
}
