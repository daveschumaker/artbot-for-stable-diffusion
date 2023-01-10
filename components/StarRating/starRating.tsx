import dynamic from 'next/dynamic'
import React from 'react'

const DynamicStarRating = dynamic(() => import('./starRating'), {
  ssr: false
})

export default function StarRating(props: any) {
  return <DynamicStarRating {...props} />
}
