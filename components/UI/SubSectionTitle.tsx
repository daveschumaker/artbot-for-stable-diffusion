import React, { CSSProperties } from 'react'

const SubSectionTitle = ({
  children,
  style
}: {
  children: React.ReactNode
  style?: CSSProperties
}) => {
  return (
    <div className="pb-[8px] font-[700]" style={style}>
      {children}
    </div>
  )
}

export default SubSectionTitle
