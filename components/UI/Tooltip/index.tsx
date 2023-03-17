import React from 'react'
import InfoIcon from '../../icons/InfoIcon'

import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import styles from './tooltip.module.css'

interface TooltipProps {
  children: React.ReactNode
  tooltipId: string
}

export default function TooltipComponent({
  children,
  tooltipId
}: TooltipProps) {
  return (
    <div className="text-sm font-normal">
      <a id={tooltipId}>
        <InfoIcon stroke="white" fill="#14B8A6" />
      </a>
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
