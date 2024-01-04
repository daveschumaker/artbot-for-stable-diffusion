import { useEffect, useState } from 'react'
import Input from 'app/_components/Input'
import { stylePresets } from './presets'
import styles from './component.module.css'
import { IconArrowBarLeft, IconPlayerPlayFilled } from '@tabler/icons-react'
import { Button } from 'app/_components/Button'
import FlexRow from 'app/_components/FlexRow'
import { handleUsePreset } from './presetController'

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay]) // Only re-call effect if value or delay changes

  return debouncedValue
}

export default function StylePresetsDropdown({
  input,
  setInput,
  handleClose
}: any) {
  const [filter, setFilter] = useState('')
  const debouncedFilter = useDebounce(filter, 150)

  const handlePresetSelect = (key: string) => {
    const updatedInput = handleUsePreset({
      key,
      input
    })

    setInput({ ...updatedInput })
    handleClose()
  }

  const renderStyleList = () => {
    const arr = []

    const p = `[user prompt]`
    const np = input.negative ? `[negative user prompt]` : ''

    for (const [key, presetDetails] of Object.entries(stylePresets)) {
      if (debouncedFilter) {
        const filterLowercase = debouncedFilter.toLowerCase()
        if (
          !key.toLowerCase().includes(filterLowercase) &&
          // @ts-ignore
          !presetDetails.model.toLowerCase().includes(filterLowercase)
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
                onClick={() => handlePresetSelect(key)}
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
