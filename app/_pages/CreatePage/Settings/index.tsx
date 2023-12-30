import { IconSettings } from '@tabler/icons-react'
import DropdownOptions from 'app/_modules/DropdownOptions'
import { Button } from 'app/_components/Button'
import Checkbox from 'app/_components/Checkbox'
import AppSettings from 'app/_data-models/AppSettings'
import { useEffect, useState } from 'react'

export default function CreatePageSettings() {
  const [showDropdown, setShowDropdown] = useState(false)

  const [savePromptOnCreate, setSavePromptOnCreate] = useState(false)
  const [stayOnCreate, setStayOnCreate] = useState(false)
  const [negativePanelOpen, setNegativePanelOpen] = useState(false)

  useEffect(() => {
    setSavePromptOnCreate(AppSettings.get('savePromptOnCreate') || false)
    setStayOnCreate(AppSettings.get('stayOnCreate') || false)
    setNegativePanelOpen(AppSettings.get('negativePanelOpen'))
  }, [])

  return (
    <>
      {showDropdown && (
        <DropdownOptions
          handleClose={() => setShowDropdown(false)}
          title="Create page settings"
          top="52px"
          maxWidth="320px"
        >
          <div style={{ padding: '4px 0' }}>
            <Checkbox
              label="Preserve prompt?"
              checked={savePromptOnCreate}
              onChange={(bool: boolean) => {
                setSavePromptOnCreate(bool)
                AppSettings.set('savePromptOnCreate', bool)
              }}
            />
          </div>
          <div style={{ padding: '4px 0' }}>
            <Checkbox
              label="Stay on page after create?"
              checked={stayOnCreate}
              onChange={(bool: boolean) => {
                setStayOnCreate(bool)
                AppSettings.set('stayOnCreate', bool)
              }}
            />
          </div>
          <div style={{ padding: '4px 0' }}>
            <Checkbox
              label="Keep negative prompt open?"
              checked={negativePanelOpen}
              onChange={(bool: boolean) => {
                setNegativePanelOpen(bool)
                AppSettings.set('negativePanelOpen', bool)
              }}
            />
          </div>
        </DropdownOptions>
      )}
      <div style={{ paddingTop: '8px', position: 'relative' }}>
        <Button onClick={() => setShowDropdown(true)} size="square-small">
          <IconSettings stroke={1.5} />
        </Button>
      </div>
    </>
  )
}
