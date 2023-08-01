import DropdownOptions from 'app/_modules/DropdownOptions'
import Checkbox from 'components/UI/Checkbox'
import AppSettings from 'models/AppSettings'
import { useEffect, useState } from 'react'
import { setPauseJobQueue } from 'store/appStore'

export default function PendingSettings({ setShowSettingsDropdown }: any) {
  const [autoclear, setAutoclear] = useState(false)
  const [pauseQueue, setPauseQueue] = useState(false)

  useEffect(() => {
    const clearValue = AppSettings.get('autoClearPending') || false
    const pauseValue = AppSettings.get('pauseJobQueue') || false

    setAutoclear(clearValue)
    setPauseQueue(pauseValue)
  }, [])

  return (
    <DropdownOptions
      handleClose={() => setShowSettingsDropdown(false)}
      title="Pending settings"
      top="46px"
      maxWidth="320px"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          rowGap: '8px',
          padding: '8px 0'
        }}
      >
        <Checkbox
          label={`Auto-clear completed?`}
          checked={autoclear}
          onChange={(bool: boolean) => {
            setAutoclear(bool)
            AppSettings.set('autoClearPending', bool)
          }}
        />
        <Checkbox
          label={`Pause job queue?`}
          checked={pauseQueue}
          onChange={(bool: boolean) => {
            setPauseQueue(bool)
            setPauseJobQueue(bool)
            AppSettings.set('pauseJobQueue', bool)
          }}
        />
      </div>
    </DropdownOptions>
  )
}
