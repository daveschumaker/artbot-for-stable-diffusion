import { useState } from 'react'
import Input from 'components/UI/Input'
import { stylePresets } from './presets'
import styles from './component.module.css'
import { IconArrowBarLeft, IconPlayerPlayFilled } from '@tabler/icons-react'
import { Button } from 'components/UI/Button'
import FlexRow from 'components/FlexRow'

export default function StylePresetsDropdown({
  input,
  setInput,
  handleClose
}: any) {
  const [filter, setFilter] = useState('')

  const handleUsePreset = (key: string) => {
    const presetDetails = stylePresets[key]
    let [positive, negative = ''] = presetDetails.prompt.split('###')
    positive = positive.replace('{p}', input.prompt)
    positive = positive.replace('{np}', '')
    negative = negative.replace('{np}', '')
    negative = `${negative} ${input.negative}`

    const updateInput = {
      prompt: positive,
      negative: negative.trim(),
      models: stylePresets[key].model
        ? [stylePresets[key].model]
        : input.models,
      orientationType: input.orientationType,
      height: input.height,
      width: input.width
    }

    if (stylePresets[key].width && stylePresets[key].height) {
      updateInput.orientationType = 'custom'
      // @ts-ignore
      updateInput.height = stylePresets[key].height
      // @ts-ignore
      updateInput.width = stylePresets[key].width
    }

    // @ts-ignore
    setInput({
      ...updateInput
    })
    handleClose()
  }

  const renderStyleList = () => {
    const arr = []

    const p = input.prompt ? input.prompt : '[no prompt set] '
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
        <div className={styles['preset-wrapper']} key={`style_${key}`}>
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

  return (
    <div>
      {' '}
      <div className={styles['filter-preset']}>
        <Input
          type="text"
          name="filterPrompt"
          placeholder="Search and filter all presets"
          onChange={(e: any) => {
            setFilter(e.target.value)
          }}
          value={filter}
          width="100%"
        />
        <Button onClick={() => setFilter('')} theme="secondary">
          <IconArrowBarLeft />
        </Button>
      </div>
      <div className={styles['style-presets-wrapper']}>{renderStyleList()}</div>
    </div>
  )
}
