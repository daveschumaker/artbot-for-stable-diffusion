import React, { CSSProperties } from 'react'

const SubSectionTitle = ({
  children,
  pb = 8,
  style
}: {
  children: React.ReactNode
  pb?: number
  style?: CSSProperties
}) => {
  return (
    <div className="font-[700]" style={{ paddingBottom: `${pb}px`, ...style }}>
      {children}
    </div>
  )
}

export default SubSectionTitle
