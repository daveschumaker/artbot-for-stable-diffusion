import { Button } from '../UI/Button'

interface Props {
  panelType: string
  handleRemoveClick: any
}

const WarningPanel = ({ panelType, handleRemoveClick }: Props) => {
  return (
    <div>
      <div className="font-bold mb-2 text-lg">WARNING:</div>
      <p>
        You currently have an image selected for {panelType}. In order to
        continue, you must cancel the {panelType} process. Do you wish to
        continue?
      </p>
      <p className="mt-2">This process cannot be undone.</p>
      <div className="mt-2">
        <Button theme="secondary" onClick={handleRemoveClick}>
          Remove {panelType}
        </Button>
      </div>
    </div>
  )
}

export default WarningPanel
