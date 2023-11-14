import Input from 'app/_components/Input'
import { stylePresets } from './presets'
import styles from './component.module.css'
import { IconArrowBarLeft, IconPlayerPlayFilled } from '@tabler/icons-react'
import { Button } from 'app/_components/Button'
import FlexRow from 'app/_components/FlexRow'
import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'
import { HordePreset } from '_types/horde'

export default function StylePresetsDropdown({
  filter,
  handleClose,
  input,
  setInput
}: any) {
  const handleUsePreset = (key: string) => {
    const presetDetails: HordePreset = stylePresets[key]
    let [positive, negative = ''] = presetDetails.prompt.split('###')
    positive = positive.replace('{p}', input.prompt)
    positive = positive.replace('{np}', '')
    negative = negative.replace('{np}', '')
    negative = `${negative} ${input.negative}`

    const updateInput: Partial<DefaultPromptInput> = {
      prompt: positive,
      hires: presetDetails.hires_fix ? presetDetails.hires_fix : input.hires,
      karras: presetDetails.karras ? presetDetails.karras : input.karras,
      negative: negative.trim(),
      models: presetDetails.model ? [presetDetails.model] : input.models,
      sampler: presetDetails.sampler_name
        ? presetDetails.sampler_name
        : input.sampler,
      cfg_scale: presetDetails.cfg_scale
        ? presetDetails.cfg_scale
        : input.cfg_scale,
      loras: presetDetails.loras ? presetDetails.loras : input.loras,
      tis: presetDetails.tis ? presetDetails.tis : input.tis,
      steps: presetDetails.steps ? presetDetails.steps : input.steps,
      orientationType: input.orientationType,
      height: input.height,
      width: input.width
    }

    if (presetDetails.width && presetDetails.height) {
      updateInput.orientationType = 'custom'
      updateInput.height = presetDetails.height
      updateInput.width = presetDetails.width
    }

    setInput({
      ...updateInput
    })
    handleClose()
  }

  const renderStyleList = () => {
    const arr = []

    const p = '[user prompt]'
    const np = input.negative ? input.negative : ''

    for (const [key, presetDetails] of Object.entries(stylePresets)) {
      if (filter) {
        if (
          !key.toLowerCase().includes(filter) &&
          // @ts-ignore
          !presetDetails.model.toLowerCase().includes(filter)
        ) {
          continue
        }
      }

      // @ts-ignore
      let modify = presetDetails.prompt.replace('{p}', p)

      if (!modify.includes('###') && np) {
        modify = modify.replace('{np}', ' ### ' + np)
      } else {
        modify = modify.replace('{np}', np)
      }

      arr.push(
        <div key={`style_${key}`}>
          <div>
            <strong>{key}</strong>
            {` / `}
            <span className="text-xs">
              {
                // @ts-ignore
                presetDetails.model
              }
            </span>
          </div>
          <FlexRow style={{ justifyContent: 'space-between' }}>
            <div className={styles['preset-description']}>{modify}</div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginLeft: '8px',
                width: '72px'
              }}
            >
              <Button
                size="small"
                onClick={() => handleUsePreset(key)}
                width="72px"
              >
                Use
                <IconPlayerPlayFilled size={14} stroke={1.5} />
              </Button>
            </div>
          </FlexRow>
        </div>
      )
    }

    return arr
  }

  return <div>{renderStyleList()}</div>
}

export const InputPresetFilter = ({ filter, setFilter }) => {
  return (
    <div className="flex flex-row">
      <Input
        type="text"
        name="filterPrompt"
        placeholder="Search and filter all presets"
        onChange={(e: any) => {
          console.log(`oi?`)
          setFilter(e.target.value)
        }}
        value={filter}
        width="100%"
      />
      <Button onClick={() => setFilter('')} theme="secondary">
        <IconArrowBarLeft />
      </Button>
    </div>
  )
}
