import dynamic from 'next/dynamic'

const DynamicInterrogate = dynamic(() => import('./interrogate'), {
  ssr: false
})

export default function Interrogate(props: any) {
  return <DynamicInterrogate {...props} />
}
