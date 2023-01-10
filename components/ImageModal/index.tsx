import dynamic from 'next/dynamic'
import React from 'react'

const DynamicImageModal = dynamic(() => import('./imageModal'), {
  ssr: false
})

export default function ImageModal(props: any) {
  return <DynamicImageModal {...props} />
}
