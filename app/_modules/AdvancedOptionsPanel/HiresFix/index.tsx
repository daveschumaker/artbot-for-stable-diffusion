import InputSwitchV2 from '../InputSwitchV2'
import { useInput } from 'app/_modules/InputProvider/context'
const HiresFix = () => {
  const { input, setInput } = useInput()

  return (
    <InputSwitchV2
      label="Hires fix"
      tooltip="Partially renders image at a lower resolution before upscaling it and adding more detail. Useful to avoid things like double heads when requesting higher resolution images."
      handleSwitchToggle={() => {
        if (!input.hires) {
          setInput({ hires: true })
        } else {
          setInput({ hires: false })
        }
      }}
      checked={input.hires}
    />
  )
}

export default HiresFix
