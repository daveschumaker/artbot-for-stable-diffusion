import dynamic from 'next/dynamic'

const DynamicHordeDropdown = dynamic(() => import('./hordeDropdown'), {
  ssr: false
})

export default function HordeDropdown(props: any) {
  return <DynamicHordeDropdown {...props} />
}
