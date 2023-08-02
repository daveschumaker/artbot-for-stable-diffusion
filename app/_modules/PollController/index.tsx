import dynamic from 'next/dynamic'

const DynamicPollController = dynamic(() => import('./pollController'), {
  ssr: false
})

export default function PollController(props: any) {
  return <DynamicPollController {...props} />
}
