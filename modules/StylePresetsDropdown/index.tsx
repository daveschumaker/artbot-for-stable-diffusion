import { useState } from 'react'
import { Button } from 'components/UI/Button'
import { IconCamera, IconPlayerPlayFilled, IconX } from '@tabler/icons-react'
import { GetSetPromptInput } from 'types'
import styles from './component.module.css'
import Overlay from 'components/UI/Overlay'
import { stylePresets } from 'models/StylePresets'

const StylePresetsDropdown = ({ input, setInput }: GetSetPromptInput) => {
  const [showMenu, setShowMenu] = useState(false)

  const handleUsePreset = (key: string) => {
    const presetDetails = stylePresets[key]
    let [positive, negative = ''] = presetDetails.prompt.split('###')
    positive = positive.replace('{p}', input.prompt)
    positive = positive.replace('{np}', '')
    negative = negative.replace('{np}', '')
    negative = `${negative} ${input.negative}`

    const updateInput = {
      prompt: positive,
      negative,
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
    setShowMenu(false)
  }

  const renderStyleList = () => {
    const arr = []

    const p = input.prompt ? input.prompt : '[no prompt set]'
    const np = input.negative ? input.negative : ''

    for (const [key, presetDetails] of Object.entries(stylePresets)) {
      let modify = presetDetails.prompt.replace('{p}', p)
      modify = modify.replace('{np}', np)

      arr.push(
        <div className={styles['preset-wrapper']} key={`style_${key}`}>
          <div>
            <strong>{key}</strong>
            {` / `}
            <span className="text-xs">{presetDetails.model}</span>
          </div>
          <div className="flex flex-row w-full justify-between">
            <div className={styles['preset-description']}>{modify}</div>
            <div style={{ marginLeft: '8px', width: '72px' }}>
              <Button
                size="small"
                onClick={() => handleUsePreset(key)}
                width="72px"
              >
                <IconPlayerPlayFilled stroke={1.5} />
                Use
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return arr
  }

  return (
    <>
      <Button
        id="style-preset-tooltip"
        size="small"
        onClick={() => setShowMenu(!showMenu)}
        width="130px"
      >
        <IconCamera stroke={1.5} />
        Style presets
      </Button>
      {showMenu && (
        <>
          <Overlay handleClose={() => setShowMenu(false)} disableBackground />
          <div className={styles['dropdown-menu']}>
            <div
              className={styles['StyledClose']}
              onClick={() => setShowMenu(false)}
            >
              <IconX stroke={1.5} />
            </div>
            <div className={styles['style-presets-wrapper']}>
              {renderStyleList()}
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default StylePresetsDropdown
