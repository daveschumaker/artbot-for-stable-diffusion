import AppSettings from 'app/_data-models/AppSettings'
import { useEffect, useState } from 'react'

export default function PromptInputSettings() {
  const [savePromptOnCreate, setSavePromptOnCreate] = useState(false)
  const [stayOnCreate, setStayOnCreate] = useState(false)
  const [negativePanelOpen, setNegativePanelOpen] = useState(false)

  useEffect(() => {
    setSavePromptOnCreate(AppSettings.get('savePromptOnCreate') || false)
    setStayOnCreate(AppSettings.get('stayOnCreate') || false)
    setNegativePanelOpen(AppSettings.get('negativePanelOpen'))
  }, [])

  return (
    <div className="form-control">
      <label className="label cursor-pointer justify-start gap-2">
        <input
          type="checkbox"
          className="toggle"
          checked={savePromptOnCreate}
          onClick={() => {
            AppSettings.set('savePromptOnCreate', !savePromptOnCreate)
            setSavePromptOnCreate(!savePromptOnCreate)
          }}
        />
        <span className="label-text">Save prompt on create?</span>
      </label>
      <label className="label cursor-pointer justify-start gap-2">
        <input
          type="checkbox"
          className="toggle"
          checked={stayOnCreate}
          onClick={() => {
            AppSettings.set('stayOnCreate', !stayOnCreate)
            setStayOnCreate(!stayOnCreate)
          }}
        />
        <span className="label-text">Stay on page after create?</span>
      </label>
      <label className="label cursor-pointer justify-start gap-2">
        <input
          type="checkbox"
          className="toggle"
          checked={negativePanelOpen}
          onClick={() => {
            AppSettings.set('negativePanelOpen', !negativePanelOpen)
            setNegativePanelOpen(!negativePanelOpen)
          }}
        />
        <span className="label-text">Keep negative prompt open?</span>
      </label>
    </div>
  )
}
