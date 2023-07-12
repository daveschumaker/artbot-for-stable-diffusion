import React from 'react'
import dynamic from 'next/dynamic'
import { SelectPropsComponent } from 'types'

const DynamicDropDownMenuItem = dynamic(() => import('./select'), {
  ssr: false
})

export default function Select(props: SelectPropsComponent) {
  return (
    <div className="grow">
      <DynamicDropDownMenuItem {...props} />
    </div>
  )
}
