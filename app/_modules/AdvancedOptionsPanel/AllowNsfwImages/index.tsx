import { useEffect, useState } from 'react'
import AppSettings from 'app/_data-models/AppSettings'
import InputSwitchV2 from '../InputSwitchV2'

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
      <InputSwitchV2
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
