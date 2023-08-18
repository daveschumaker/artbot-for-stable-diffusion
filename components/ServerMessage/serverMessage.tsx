import Panel from 'app/_components/Panel'

const ServerMessage = ({
  title,
  content,
  timestamp
}: {
  title: string
  content: string
  timestamp?: number
}) => {
  if (!title || !content) {
    return null
  }

  let timeDiff = 0

  // @ts-ignore
  if (timestamp) {
    // @ts-ignore
    timeDiff = Math.floor((Date.now() - timestamp) / 60000)

    if (timeDiff <= 1) {
      timeDiff = 1
    }
  }

  return (
    <div className="mt-2 mb-4">
      <Panel>
        <div className="font-[700] mb-2">{title}</div>
        <div dangerouslySetInnerHTML={{ __html: content }} />
        {timeDiff > 0 ? (
          <div className="mt-2 text-xs italic">
            Posted ~{timeDiff} minute{timeDiff !== 1 ? 's' : ''} ago
          </div>
        ) : null}
      </Panel>
    </div>
  )
}

export default ServerMessage
