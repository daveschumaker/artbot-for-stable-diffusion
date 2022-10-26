import dynamic from 'next/dynamic'

const DynamicMobileFooter = dynamic(() => import('./mobileFooter'), {
  suspense: true
})

export default function Modal() {
  return <DynamicMobileFooter />
}
