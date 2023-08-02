import React, { CSSProperties } from 'react'

const TextTooltipRow = ({
  children,
  style
}: {
  children: React.ReactNode
  style?: CSSProperties
}) => {
  return (
    <div className="flex flex-row items-center" style={style}>
      {children}
    </div>
  )
}

export default TextTooltipRow
