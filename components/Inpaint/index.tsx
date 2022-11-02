import dynamic from 'next/dynamic'

const DynamicInpaint = dynamic(() => import('./inpaint'), {
  ssr: false
})

export default function Inpaint(props: any) {
  return <DynamicInpaint {...props} />
}
