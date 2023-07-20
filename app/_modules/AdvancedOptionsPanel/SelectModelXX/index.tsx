import dynamic from 'next/dynamic'

const DynamicSelectModel = dynamic(() => import('./selectModel'), {
  ssr: false
})

export default function AdvancedOptionsPanel(props: any) {
  return <DynamicSelectModel {...props} />
}
