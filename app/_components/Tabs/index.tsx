import React from 'react'

const Tabs = (props: any) => {
  const { children } = props

  return (
    <div className="tabs">
      <ol
        className="tab-list"
        style={{
          borderBottom: '1px solid var(--input-text)',
          padding: '0 8px'
        }}
      >
        {children}
      </ol>
    </div>
  )
}

export default Tabs
