import dynamic from 'next/dynamic'

const DynamicDropDownMenu = dynamic(() => import('./dropDownMenu'), {
  ssr: false
})

export default function Overlay(props: any) {
  return <DynamicDropDownMenu {...props} />
}
