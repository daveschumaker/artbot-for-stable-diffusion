import dynamic from 'next/dynamic'

const DynamicServerMessage = dynamic(() => import('./serverMessage'), {
  // suspense: true
})

export default function ServerMessage(props: any) {
  return <DynamicServerMessage {...props} />
}
