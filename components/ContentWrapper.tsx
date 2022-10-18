import React from 'react'

interface ContentWrapperProps {
  children: React.ReactNode
}

export default function ContentWrapper(props: ContentWrapperProps) {
  return (
    <div className="mx-auto max-w-screen-md mx-auto pt-2 pb-[68px] md:pb-2 px-4 md:px-2 flex flex-col relative h-full">
      {props.children}
    </div>
  )
}
