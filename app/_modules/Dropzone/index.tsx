import dynamic from 'next/dynamic'
import React from 'react'

const DynamicDropzone = dynamic(() => import('./dropzone'), {
  ssr: false
})

export default function Dropzone({
  handleUpload,
  type
}: {
  handleUpload: any
  type: string
}) {
  return <DynamicDropzone handleUpload={handleUpload} type={type} />
}
