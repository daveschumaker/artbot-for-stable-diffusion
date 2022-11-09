import dynamic from 'next/dynamic'

const DynamicPendingPage = dynamic(() => import('./pendingPage'), {
  ssr: false
})

export default function PainterCanvas(props: any) {
  return <DynamicPendingPage {...props} />
}
