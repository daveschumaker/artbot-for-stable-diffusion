import Section from 'components/UI/Section'
import { useReducer } from 'react'
import NumericInputSlider from './NumericInputSlider'

const Fingers = () => {
  const [input, setInput] = useReducer(
    (state: any, newState: any) => {
      const updatedInputState = { ...state, ...newState }
      return updatedInputState
    },
    { fingers: 5 }
  )

  const time = new Date()
  if (time.getDate() !== 1 && typeof window !== 'undefined') {
    return null
  }

  return (
    <Section>
      <NumericInputSlider
        label="Fingers to render"
        tooltip="Attempt to force latent diffusion models to render an exact and specific number of fingers. Not guaranteed to work."
        from={2}
        to={200}
        step={1}
        input={input}
        setInput={setInput}
        fieldName="fingers"
        enforceStepValue
      />
    </Section>
  )
}

export default Fingers
