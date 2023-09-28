import AwesomeModal from './awesomeModal'
import { ContentHeightProvider } from './awesomeModalProvider'

export default function AwesomeModalWrapper(props: any) {
  return (
    <ContentHeightProvider>
      <AwesomeModal {...props} />
    </ContentHeightProvider>
  )
}
