import dynamic from 'next/dynamic'

const DynamicStylesDropdown = dynamic(() => import('./stylesDropdown'), {})

export default function StylesDropdown(props: any) {
  return <DynamicStylesDropdown {...props} />
}
