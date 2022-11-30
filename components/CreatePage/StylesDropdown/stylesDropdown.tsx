import SelectComponent from '../../UI/Select'
import { sortedPresets, stylePresets } from '../../../utils/stylePresets'
import { useEffect, useState } from 'react'

interface IProps {
  input: any
  setInput(obj: any): any
}

const presetOptions = () => {
  let options = [{ value: 'none', label: 'None' }]

  sortedPresets().forEach((preset) => {
    options.push({ value: preset, label: preset })
  })

  options.push({ value: 'random', label: 'random' })

  return options
}

const StylesDrodown = ({ input, setInput }: IProps) => {
  const [presetValue, setPresetValue] = useState({
    value: 'none',
    label: 'None'
  })
  presetOptions()

  const handleSelect = (obj: { value: string; label: string }) => {
    let isNotListed = false
    let presetValue = obj.value

    if (presetValue === 'none' || presetValue === 'random') {
      isNotListed = true
    }

    setInput({
      // @ts-ignore
      models: isNotListed ? input.models : [stylePresets[obj.value].model],
      stylePreset: obj.value
    })
  }

  useEffect(() => {
    const updateValue = presetOptions().filter((option) => {
      return input?.stylePreset === option.value
    })[0]

    setPresetValue(updateValue)
  }, [input?.stylePreset])

  return (
    <div>
      <SelectComponent
        onChange={handleSelect}
        options={presetOptions()}
        value={presetValue}
        className="w-[180px]"
      />
    </div>
  )
}

export default StylesDrodown
