import React from 'react'
import dynamic from 'next/dynamic'
import { SelectPropsComponent } from '_types'

const DynamicDropDownMenuItem = dynamic(() => import('./select'), {
  ssr: false
})

export default function Select(props: SelectPropsComponent) {
  return (
    <div className="grow" style={{ width: props?.width ?? '100%' }}>
      <DynamicDropDownMenuItem {...props} />
    </div>
  )
}
