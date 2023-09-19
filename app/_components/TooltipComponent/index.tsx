import React from 'react'

import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import styles from './tooltip.module.css'
import { IconInfoCircleFilled } from '@tabler/icons-react'

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
    <div className="text-sm font-normal" style={{ marginLeft: '4px' }}>
      {!hideIcon && (
        <a id={tooltipId}>
          <IconInfoCircleFilled style={{ color: '#14B8A6' }} size={20} />
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
