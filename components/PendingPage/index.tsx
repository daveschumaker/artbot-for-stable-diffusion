import dynamic from 'next/dynamic'

const DynamicPendingPage = dynamic(() => import('./pendingPage'), {
  ssr: false
})

export default function PendingPage(props: any) {
  return <DynamicPendingPage {...props} />
}
