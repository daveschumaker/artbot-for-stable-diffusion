import dynamic from 'next/dynamic'

const DynamicLoraSelect = dynamic(() => import('./loraSelect'), {
  ssr: false
})

export default function LoraSelect(props: any) {
  return <DynamicLoraSelect {...props} />
}
