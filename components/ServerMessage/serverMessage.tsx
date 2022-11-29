import { useStore } from 'statery'
import { appInfoStore } from '../../store/appStore'
import Panel from '../UI/Panel'

const ServerMessage = () => {
  const appState = useStore(appInfoStore)
  const { serverMessage } = appState

  if (!serverMessage) {
    return null
  }

  return (
    <div className="mt-2 mb-4">
      <Panel>
        <div dangerouslySetInnerHTML={{ __html: serverMessage }} />
      </Panel>
    </div>
  )
}

export default ServerMessage
