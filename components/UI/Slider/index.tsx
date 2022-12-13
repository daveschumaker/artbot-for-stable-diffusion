import dynamic from 'next/dynamic'

const DynamicSlider = dynamic(() => import('./slider'), {
  // suspense: true
})

export default function Slider(props: any) {
  return <DynamicSlider {...props} />
}
