import dynamic from 'next/dynamic'

const DynamicPainterPanel = dynamic(() => import('./painterPanel'), {})

export default function PainterPanel(props: any) {
  return <DynamicPainterPanel {...props} />
}
