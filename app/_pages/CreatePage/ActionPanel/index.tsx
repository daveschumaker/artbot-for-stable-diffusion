import dynamic from 'next/dynamic'

interface Props {
  errors: { [key: string]: boolean }
  input: string
  disableSubmit?: boolean
  setInput: any
  resetInput: () => void
  handleSubmit: () => void
  pending: boolean
  totalImagesRequested: number
  loggedIn: boolean | null
  totalKudosCost: number
  kudosPerImage: string
  showStylesDropdown?: boolean
}

const DynamicActionPanel = dynamic(() => import('./actionPanel'), {
  ssr: false
})

export default function ActionPanel(props: Props) {
  return <DynamicActionPanel {...props} />
}
