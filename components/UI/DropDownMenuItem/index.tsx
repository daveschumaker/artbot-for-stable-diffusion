import dynamic from 'next/dynamic'

const DynamicDropDownMenuItem = dynamic(() => import('./dropDownMenuItem'), {
  ssr: false
})

export default function DropDownMenuItem(props: any) {
  return <DynamicDropDownMenuItem {...props} />
}
