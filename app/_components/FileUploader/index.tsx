import dynamic from 'next/dynamic'
import React from 'react'

const DynamicFileUploader = dynamic(() => import('./fileUploader'), {
  ssr: false
})

export default function FileUploader({ handleUpload }: { handleUpload: any }) {
  return <DynamicFileUploader handleUpload={handleUpload} />
}
