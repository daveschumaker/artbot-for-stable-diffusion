import React from 'react'

const Content = ({ children }: { children: React.ReactNode }) => {
  return <div className={'global-wrapper'}>{children}</div>
}

export default Content
