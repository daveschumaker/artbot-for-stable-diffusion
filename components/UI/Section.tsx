import React from 'react'

const Section = ({ children }: { children?: React.ReactNode }) => {
  return <div className="pt-[16px] first:pt-[0]">{children}</div>
}

export default Section
