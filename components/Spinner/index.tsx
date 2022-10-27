import dynamic from 'next/dynamic'

const DynamicSpinner = dynamic(() => import('./spinner'), {
  // suspense: true
})

export default function SpinnerV2() {
  return <DynamicSpinner />
}
