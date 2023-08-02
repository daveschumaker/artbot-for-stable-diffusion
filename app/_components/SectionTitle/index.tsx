import React, { CSSProperties } from 'react'

const SectionTitle = ({
  children,
  style
}: {
  children: React.ReactNode
  style?: CSSProperties
}) => {
  return (
    <div
      className="mt-0 mb-2 text-teal-500 text-[16px] font-[700] md:text-[20px]"
      style={style}
    >
      {children}
    </div>
  )
}

export default SectionTitle
