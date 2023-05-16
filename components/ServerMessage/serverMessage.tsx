import { useStore } from 'statery'
import { appInfoStore } from '../../store/appStore'
import Panel from '../UI/Panel'

const ServerMessage = () => {
  const appState = useStore(appInfoStore)
  const { serverMessage } = appState

  console.log(`serverMessage?`, serverMessage)

  if (!serverMessage || !serverMessage.title || !serverMessage.content) {
    return null
  }

  let timeDiff = 0

  // @ts-ignore
  if (serverMessage.timeDiffSec) {
    // @ts-ignore
    timeDiff = Math.floor(serverMessage.timeDiffSec / 60)
  }

  return (
    <div className="mt-2 mb-4">
      <Panel>
        <div className="font-[700] mb-2">{serverMessage.title}</div>
        <div dangerouslySetInnerHTML={{ __html: serverMessage.content }} />
        {timeDiff && (
          <div className="mt-2 text-xs italic">
            Posted ~{timeDiff} minute{timeDiff !== 1 ? 's' : ''} ago
          </div>
        )}
      </Panel>
    </div>
  )
}

export default ServerMessage
