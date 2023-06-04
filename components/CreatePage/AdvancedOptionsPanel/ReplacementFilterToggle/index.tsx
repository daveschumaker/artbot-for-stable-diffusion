import { useEffect, useState } from 'react'
import InputSwitch from '../InputSwitch'
import AppSettings from 'models/AppSettings'

const KEY = 'useReplacementFilter'

const ReplacementFilterToggle = () => {
  const [allow, setAllow] = useState(false)

  const handleSwitchSelect = (value: boolean) => {
    AppSettings.save(KEY, value)
    setAllow(value)
  }

  useEffect(() => {
    const isAllowed = AppSettings.get(KEY)
    setAllow(isAllowed)
  }, [])

  return (
    <div>
      <InputSwitch
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
