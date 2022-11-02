import dynamic from 'next/dynamic'

const DynamicInpaintingPanel = dynamic(() => import('./inpaintingPanel'), {})

export default function InpaintingPanel(props: any) {
  return <DynamicInpaintingPanel {...props} />
}
