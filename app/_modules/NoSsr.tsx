import dynamic from 'next/dynamic'
import React from 'react'

interface NonSsrProps {
  children: React.ReactNode
}
const NonSSRWrapper = (props: NonSsrProps) => (
  <React.Fragment>{props.children}</React.Fragment>
)
export default dynamic(() => Promise.resolve(NonSSRWrapper), {
  ssr: false
})
