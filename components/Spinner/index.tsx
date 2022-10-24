import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const DynamicSpinner = dynamic(() => import('./spinner'), {
  suspense: true
})

export default function SpinnerV2() {
  return (
    <Suspense fallback={`Loading...`}>
      <DynamicSpinner />
    </Suspense>
  )
}
