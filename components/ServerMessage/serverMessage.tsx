import { useStore } from 'statery'
import { appInfoStore } from '../../store/appStore'
import Panel from '../UI/Panel'

const ServerMessage = () => {
  const appState = useStore(appInfoStore)
  const { clusterSettings } = appState
  const { serverMessage } = clusterSettings

  if (!serverMessage || !serverMessage.title) {
    return null
  }

  return (
    <div className="mt-2 mb-4">
      <Panel>
        <div className="font-[700] mb-2">{serverMessage.title}</div>
        <div dangerouslySetInnerHTML={{ __html: serverMessage.content }} />
      </Panel>
    </div>
  )
}

export default ServerMessage
