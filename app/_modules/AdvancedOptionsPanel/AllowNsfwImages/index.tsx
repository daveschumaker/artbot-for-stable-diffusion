import { useEffect, useState } from 'react'
import InputSwitch from '../InputSwitch'
import AppSettings from 'models/AppSettings'

const KEY = 'allowNsfwImages'

const AllowNsfwImages = () => {
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
        label="Allow NSFW Generations"
        tooltip="When disabled, this will tell GPU workers to attempt to filter and censor out any accidental NSFW generations."
        handleSwitchToggle={() => {
          handleSwitchSelect(!allow)
        }}
        checked={allow}
      />
    </div>
  )
}

export default AllowNsfwImages
