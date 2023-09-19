import { useEffect, useState } from 'react'
import AppSettings from 'app/_data-models/AppSettings'
import InputSwitchV2 from '../InputSwitchV2'

const KEY = 'slow_workers'

const SlowWorkers = () => {
  const [optionBoolean, setOptionBoolean] = useState(false)

  const handleSwitchSelect = (value: boolean) => {
    AppSettings.save(KEY, value)
    setOptionBoolean(value)
  }

  useEffect(() => {
    const isAllowed = AppSettings.get(KEY) !== false
    setOptionBoolean(isAllowed)
  }, [])

  return (
    <div>
      <InputSwitchV2
        label="Use slow workers"
        tooltip="Allow slower workers to pick up your requests. Disabling this incurs an extra kudos cost."
        handleSwitchToggle={() => {
          handleSwitchSelect(!optionBoolean)
        }}
        checked={optionBoolean}
      />
    </div>
  )
}

export default SlowWorkers
