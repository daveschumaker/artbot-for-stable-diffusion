import React, { CSSProperties } from 'react'

const SubSectionTitle = ({
  children,
  pb,
  style
}: {
  children: React.ReactNode
  pb?: number
  style?: CSSProperties
}) => {
  const styles = {
    ...style
  }

  if (typeof pb !== 'undefined' && !isNaN(pb)) {
    styles.paddingBottom = `${pb}px`
  }

  return (
    <div className="pb-[8px] font-[700]" style={styles}>
      {children}
    </div>
  )
}

export default SubSectionTitle
