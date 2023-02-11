import React from 'react'

const SectionTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mt-0 mb-2 text-teal-500 text-[16px] font-[700] md:text-[20px]">
      {children}
    </div>
  )
}

export default SectionTitle
