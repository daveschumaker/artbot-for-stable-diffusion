import React, { useCallback } from 'react'
import Section from 'app/_components/Section'
import styles from './loraSelect.module.css'
import { Button } from 'app/_components/Button'
import {
  IconExternalLink,
  IconHeart,
  IconHistory,
  IconPlus,
  IconTrash
} from '@tabler/icons-react'
import NumberInput from 'app/_components/NumberInput'
import Linker from 'app/_components/Linker'
import FlexRow from 'app/_components/FlexRow'
import { modelStore } from 'app/_store/modelStore'
import Slider from 'app/_components/Slider'
import { useModal } from '@ebay/nice-modal-react'
import AwesomeModalWrapper from 'app/_modules/AwesomeModal'
import LoraSearchModal from './modals/LoraSearchModal'
import { handleConvertLora } from './loraUtils'
import LoraFavRecentModal from './modals/LoraFavRecentModal'
import { useInput } from 'app/_modules/InputProvider/context'
import clsx from 'clsx'

const LoraSelect = ({ setErrors }: any) => {
  const { input, setInput } = useInput()
  const lorasModal = useModal(AwesomeModalWrapper)

  const handleSaveRecent = (loraDetails: any) => {
    // Check if the local storage already has an array stored
    let existingArray = localStorage.getItem('recentLoras')
    let newArray

    if (existingArray) {
      // Parse the existing array from the local storage
      newArray = JSON.parse(existingArray)

      // Check if the object with the same id already exists in the array
      const existingObjectIndex = newArray.findIndex(
        (obj: any) => obj.name === loraDetails.name
      )

      if (existingObjectIndex !== -1) {
        // Remove the existing object from the array
        newArray.splice(existingObjectIndex, 1)
      }

      // Add the object to the front of the array
      newArray.unshift(loraDetails)

      // Limit the array to 25 elements
      if (newArray.length > 25) {
        newArray = newArray.slice(0, 25)
      }
    } else {
      // Create a new array with the object
      newArray = [loraDetails]
    }

    // Store the updated array back in the local storage
    localStorage.setItem('recentLoras', JSON.stringify(newArray))
  }

  const handleAddLora = (loraDetails: any) => {
    const modelDetails = modelStore.state.modelDetails[input.models[0]]
    const lorasToUpdate = [...input.loras]

    const exists = lorasToUpdate.filter(
      (lora) => lora.name === loraDetails.name
    )

    if (exists.length > 0) {
      return
    }

    if (
      loraDetails.baseModel === 'SD 1.5' &&
      modelDetails.baseline === 'stable diffusion 1'
    ) {
      // do nothing, things are cool
      handleSaveRecent(loraDetails)
    } else if (
      loraDetails.baseModel.includes('SDXL') &&
      input.models[0].includes('SDXL')
    ) {
      // do nothing, things are cool
      handleSaveRecent(loraDetails)
    } else {
      setErrors({ UNCOMPATIBLE_LORA: true })
    }

    lorasToUpdate.push(
      Object.assign({}, loraDetails, {
        model: 1,
        clip: 1
      })
    )

    setInput({ loras: [...lorasToUpdate] })
  }

  const handleDeleteLora = useCallback(
    (i: number) => {
      const lorasToUpdate = [...input.loras].filter((lora, idx) => i !== idx)
      setInput({ loras: [...lorasToUpdate] })
    },
    [input.loras, setInput]
  )

  const handleUpdate = useCallback(
    (i: number, field: string, value: any) => {
      if (!i && i !== 0) {
        return
      }

      const lorasToUpdate = [...input.loras]
      // @ts-ignore
      lorasToUpdate[Number(i)][field] = value

      setInput({ loras: [...lorasToUpdate] })
    },
    [input.loras, setInput]
  )

  const renderLoras = useCallback(() => {
    const arr: any = []

    if (!input.loras || !Array.isArray(input.loras)) {
      return null
    }

    input.loras.forEach((lora: any, i: number) => {
      // Need to cast input to correct type
      // @ts-ignore
      const hasWords = lora?.trainedWords?.length > 0
      // @ts-ignore
      const displayName = lora?.label

      arr.push(
        <div
          className={styles['lora-model-box']}
          key={`lora_${lora.name}_${i}`}
        >
          <div className={styles['lora-name']}>
            <div className="flex flex-col">
              <div className="font-bold text-[14px] flex flex-row gap-2 items-center">
                {displayName}
                <Linker
                  href={`https://civitai.com/models/${lora.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div title="View LORA on CivitAI">
                    <IconExternalLink size={18} />
                  </div>
                </Linker>
              </div>
            </div>
            <Button
              className={styles['lora-btn']}
              theme="secondary"
              onClick={() => handleDeleteLora(i)}
            >
              <IconTrash />
            </Button>
          </div>
          <div className="w-full">
            <Section>
              <div className="flex flex-row items-center justify-between">
                <div
                  style={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '14px',
                    width: 'var(--options-label-width)'
                  }}
                >
                  Strength
                </div>
                <FlexRow gap={4} justifyContent="space-between">
                  <div className={styles['slider-wrapper']}>
                    <Slider
                      value={lora.model}
                      min={-5.0}
                      max={5.0}
                      step={0.05}
                      onChange={(e: any) => {
                        handleUpdate(i, 'model', Number(e.target.value))
                      }}
                    />
                  </div>
                  <NumberInput
                    className={styles['input-width']}
                    min={-5.0}
                    max={5.0}
                    onMinusClick={() => {
                      handleUpdate(
                        i,
                        'model',
                        Number((lora.model - 0.05).toFixed(2))
                      )
                    }}
                    onPlusClick={() => {
                      handleUpdate(
                        i,
                        'model',
                        Number((lora.model + 0.05).toFixed(2))
                      )
                    }}
                    onInputChange={(e: any) => {
                      handleUpdate(i, 'model', Number(e.target.value))
                    }}
                    onBlur={(e: any) => {
                      handleUpdate(i, 'model', Number(e.target.value))
                    }}
                    value={lora.model}
                    width="100%"
                  />
                </FlexRow>
              </div>
            </Section>
            <Section style={{ marginTop: '8px' }}>
              <div className="flex flex-row items-center justify-between">
                <div
                  style={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '14px',
                    width: 'var(--options-label-width)'
                  }}
                >
                  CLIP
                </div>
                <FlexRow gap={4} justifyContent="space-between">
                  <div className={styles['slider-wrapper']}>
                    <Slider
                      value={lora.clip}
                      min={-5.0}
                      max={5.0}
                      step={0.05}
                      onChange={(e: any) => {
                        handleUpdate(i, 'clip', Number(e.target.value))
                      }}
                    />
                  </div>
                  <NumberInput
                    className={styles['input-width']}
                    min={-5.0}
                    max={5.0}
                    onMinusClick={() => {
                      handleUpdate(
                        i,
                        'clip',
                        Number((lora.clip - 0.05).toFixed(2))
                      )
                    }}
                    onPlusClick={() => {
                      handleUpdate(
                        i,
                        'clip',
                        Number((lora.clip + 0.05).toFixed(2))
                      )
                    }}
                    onInputChange={(e: any) => {
                      handleUpdate(i, 'clip', Number(e.target.value))
                    }}
                    onBlur={(e: any) => {
                      handleUpdate(i, 'clip', Number(e.target.value))
                    }}
                    value={lora.clip}
                    width="100%"
                  />
                </FlexRow>
              </div>
            </Section>
            {hasWords && (
              <Section style={{ marginTop: '8px' }}>
                <div
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    columnGap: '8px'
                  }}
                >
                  <div
                    style={{
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '14px',
                      width: 'var(--options-label-width)'
                    }}
                  >
                    Keywords
                  </div>
                  <FlexRow gap={4}>
                    {// @ts-ignore
                    lora?.trainedWords?.map((word: string, i: number) => {
                      // Split the word by comma and filter out any empty strings
                      const parts = word
                        .split(',')
                        .filter((part) => part.trim() !== '')
                      return parts.map((part, partIndex) => {
                        // Check if the part is not an empty string
                        if (part.trim() !== '') {
                          return (
                            <div
                              className={clsx(
                                styles['keyword-tag'],
                                input.prompt.includes(part.trim()) &&
                                  styles['remove-keyword']
                              )}
                              // Unique key using both the original index and the part index
                              key={lora.name + '_' + i + '_' + partIndex}
                              onClick={() => {
                                // Trim and prepare the part to be added or removed
                                const trimmedPart = part.trim()

                                // Check if the part already exists in the input prompt
                                if (input.prompt.includes(trimmedPart)) {
                                  // If it exists, remove the part and the preceding comma
                                  // Use regex to replace the first occurrence of ', part' or 'part, '
                                  const updatedPrompt = input.prompt.replace(
                                    new RegExp(`,? *${trimmedPart}`),
                                    ''
                                  )

                                  // Update the input prompt, trimming any leading or trailing whitespace
                                  setInput({ prompt: updatedPrompt.trim() })
                                } else {
                                  // If it doesn't exist, add the part with a preceding comma
                                  const updatedPrompt = `${input.prompt}, ${trimmedPart}`

                                  // Update the input prompt
                                  setInput({ prompt: updatedPrompt.trim() })
                                }
                              }}
                            >
                              {input.prompt.includes(part.trim()) && (
                                <IconTrash stroke={1.5} size={18} />
                              )}
                              {part}
                            </div>
                          )
                        }
                        return null // Return null for empty strings, so nothing is rendered
                      })
                    })}
                    <div></div>
                  </FlexRow>
                </div>
              </Section>
            )}
          </div>
        </div>
      )
    })

    if (arr.length === 0) {
      return null
    }

    return arr
  }, [handleDeleteLora, handleUpdate, input.loras, input.prompt, setInput])

  // useEffect(() => {
  //   if (input.loras.length > 0 && !loadedLoras) {
  //     fetchLoras()
  //     setLoadedLoras(true)
  //   }
  // }, [fetchLoras, input.loras.length, loadedLoras])

  return (
    <div style={{ marginBottom: '8px' }}>
      <div>
        <FlexRow
          style={{
            columnGap: '8px',
            justifyContent: 'space-between',
            marginBottom: '8px',
            position: 'relative',
            width: '100%'
          }}
        >
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'row',
              columnGap: '2px',
              fontWeight: 700,
              fontSize: '14px',
              width: 'var(--options-label-width)'
            }}
          >
            LoRAs
            <span style={{ fontSize: '12px', fontWeight: 400 }}>
              &nbsp;({input.loras.length} / 5)
            </span>
          </div>
          <FlexRow
            gap={4}
            style={{ justifyContent: 'flex-end', width: 'auto' }}
          >
            <Button
              className={styles['lora-btn']}
              onClick={() => {
                lorasModal.show({
                  children: (
                    <LoraSearchModal
                      handleAddLora={(lora) => {
                        const loraDetails = handleConvertLora(lora)
                        handleAddLora(loraDetails)
                      }}
                    />
                  ),
                  label: 'Search LORAs'
                })
              }}
              disabled={input.loras.length >= 5}
            >
              <IconPlus stroke={1.5} />
            </Button>
            <Button
              className={styles['lora-btn']}
              onClick={() => {
                lorasModal.show({
                  children: (
                    <LoraFavRecentModal
                      filterType="favorites"
                      handleAddLora={handleAddLora}
                      handleSaveRecent={handleSaveRecent}
                    />
                  ),
                  label: 'Favorite LORAs'
                })
              }}
              disabled={input.loras.length >= 5}
            >
              <IconHeart stroke={1.5} />
            </Button>
            <Button
              className={styles['lora-btn']}
              onClick={() => {
                lorasModal.show({
                  children: (
                    <LoraFavRecentModal
                      filterType="recents"
                      handleAddLora={handleAddLora}
                      handleSaveRecent={handleSaveRecent}
                    />
                  ),
                  label: 'Recently Used LORAs'
                })
              }}
              disabled={input.loras.length >= 5}
            >
              <IconHistory stroke={1.5} />
            </Button>
          </FlexRow>
        </FlexRow>
        {renderLoras()}
      </div>
    </div>
  )
}

const areEqual = (prevProps: any, nextProps: any) => {
  if (JSON.stringify(prevProps.loras) !== JSON.stringify(nextProps.loras)) {
    return true
  }

  return false
}

export default React.memo(LoraSelect, areEqual)
