import { useEffect, useState } from 'react'
import AppSettings from 'app/_data-models/AppSettings'
import InputSwitchV2 from '../InputSwitchV2'

const KEY = 'useReplacementFilter'

const ReplacementFilterToggle = () => {
  const [allow, setAllow] = useState(false)

  const handleSwitchSelect = (value: boolean) => {
    AppSettings.save(KEY, value)
    setAllow(value)
  }

  useEffect(() => {
    let isAllowed = false

    if (AppSettings.get(KEY) !== false) {
      isAllowed = true
    }

    setAllow(isAllowed)
  }, [])

  return (
    <div>
      <InputSwitchV2
        label="Use Prompt Replacement Filter"
        tooltip="When enabled, this tells the AI Horde backend to replace any inadvertently suspicious words sent along with a NSFW model that might normally trigger a user timeout."
        handleSwitchToggle={() => {
          handleSwitchSelect(!allow)
        }}
        checked={allow}
      />
    </div>
  )
}

export default ReplacementFilterToggle
