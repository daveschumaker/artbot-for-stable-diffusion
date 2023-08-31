import React, { useCallback, useState } from 'react'
import Section from 'app/_components/Section'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import styles from './loraSelect.module.css'
import { Button } from 'components/UI/Button'
import { IconExternalLink, IconPlus, IconTrash } from '@tabler/icons-react'
import ChooseLoraModal from './ChooseLoraModal'
import NumberInput from 'app/_components/NumberInput'
import Slider from 'components/UI/Slider'
import Linker from 'components/UI/Linker'
import FlexRow from 'app/_components/FlexRow'
import FlexibleRow from 'app/_components/FlexibleRow'
import FlexibleUnit from 'app/_components/FlexibleUnit'
import { modelStore } from 'store/modelStore'

const LoraSelect = ({ input, setInput, setErrors }: any) => {
  const [showModal, setShowModal] = useState(false)

  const handleAddLora = (loraDetails: any) => {
    console.log(`loraDetails`, loraDetails)
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
    } else if (
      loraDetails.baseModel.includes('SDXL') &&
      input.models[0].includes('SDXL')
    ) {
      // do nothing, things are cool
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
    (i: number, value: any) => {
      if (!i && i !== 0) {
        return
      }

      const lorasToUpdate = [...input.loras]
      lorasToUpdate[Number(i)].model = value

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
              {displayName}
              <div
                className="flex flex-row gap-2 items-center"
                style={{
                  fontSize: '12px'
                }}
              >
                <Linker
                  href={`https://civitai.com/models/${lora.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  [ View on Civitai]
                </Linker>
                <IconExternalLink size={18} />
              </div>
            </div>
            <Button
              size="small"
              theme="secondary"
              onClick={() => handleDeleteLora(i)}
            >
              <IconTrash />
            </Button>
          </div>
          <div className="w-full">
            <Section>
              <div className="flex flex-row items-center justify-between">
                <SubSectionTitle>
                  LoRA strength
                  <div className="block text-xs w-full">
                    ({-5.0} - {5.0})
                  </div>
                </SubSectionTitle>
                <NumberInput
                  min={-5.0}
                  max={5.0}
                  onMinusClick={() => {
                    handleUpdate(i, Number((lora.model - 0.05).toFixed(2)))
                  }}
                  onPlusClick={() => {
                    handleUpdate(i, Number((lora.model + 0.05).toFixed(2)))
                  }}
                  onInputChange={(e: any) => {
                    handleUpdate(i, Number(e.target.value))
                  }}
                  onBlur={(e: any) => {
                    handleUpdate(i, Number(e.target.value))
                  }}
                  value={lora.model}
                  width="100%"
                />
              </div>
              <Slider
                value={lora.model}
                min={-5.0}
                max={5.0}
                step={0.05}
                onChange={(e: any) => {
                  handleUpdate(i, Number(e.target.value))
                }}
              />
            </Section>
            <div className="w-full">
              <Section>
                <div className="flex flex-col justify-between">
                  <SubSectionTitle>
                    Trigger words
                    {!hasWords && (
                      <div style={{ fontWeight: 400, fontSize: '12px' }}>
                        (This LoRA does not utilize any trained words)
                      </div>
                    )}
                    {hasWords && (
                      <div style={{ fontWeight: 400, fontSize: '12px' }}>
                        (Don&apos;t forget to add one of these to your prompt)
                      </div>
                    )}
                    <div
                      className="flex flex-row flex-wrap font-[400] cursor-pointer"
                      style={{
                        columnGap: '8px',
                        color: '#17cfbb'
                      }}
                    >
                      {
                        // @ts-ignore
                        lora?.trainedWords?.map((word: string, i: number) => {
                          return (
                            <div
                              key={lora.name + '_' + i}
                              onClick={() => {
                                setInput({ prompt: input.prompt + ' ' + word })
                              }}
                            >
                              {word}
                            </div>
                          )
                        })
                      }
                    </div>
                  </SubSectionTitle>
                </div>
              </Section>
            </div>
          </div>
        </div>
      )
    })

    if (arr.length === 0) {
      return null
    }

    // Helper function to chunk the array into pairs
    const chunkArray = (arr: any[], size: number) =>
      Array.from({ length: Math.ceil(arr.length / size) }, (_, index) =>
        arr.slice(index * size, index * size + size)
      )

    // Chunk the components into pairs
    const groupedComponents = chunkArray(arr, 2)

    return (
      <>
        {groupedComponents.map((row, rowIndex) => (
          <FlexibleRow key={rowIndex}>
            {row.map((item, itemIndex) => (
              <FlexibleUnit key={itemIndex}>{item}</FlexibleUnit>
            ))}
          </FlexibleRow>
        ))}
      </>
    )
  }, [handleDeleteLora, handleUpdate, input.loras, input.prompt, setInput])

  // useEffect(() => {
  //   if (input.loras.length > 0 && !loadedLoras) {
  //     fetchLoras()
  //     setLoadedLoras(true)
  //   }
  // }, [fetchLoras, input.loras.length, loadedLoras])

  return (
    <Section>
      <div
        style={{
          border: '1px solid rgb(126, 90, 108)',
          padding: '8px 16px',
          borderRadius: '4px'
        }}
      >
        <SubSectionTitle>
          <FlexRow
            style={{
              columnGap: '8px',
              justifyContent: 'space-between',
              position: 'relative',
              width: '100%'
            }}
          >
            <div>
              Select LoRAs
              <div style={{ fontWeight: 400, fontSize: '12px' }}>
                (Maximum of 5 LoRAs)
              </div>
            </div>
            <div
              className="mb-2 relative"
              style={{
                marginBottom: '12px'
              }}
            >
              <Button
                size="small"
                onClick={() => setShowModal(true)}
                disabled={input.loras.length >= 5}
              >
                <IconPlus />
              </Button>
            </div>
            {showModal && (
              <ChooseLoraModal
                handleClose={() => setShowModal(false)}
                handleAddLora={handleAddLora}
              />
            )}
          </FlexRow>
        </SubSectionTitle>
        {renderLoras()}
      </div>
    </Section>
  )
}

const areEqual = (prevProps: any, nextProps: any) => {
  if (JSON.stringify(prevProps.loras) !== JSON.stringify(nextProps.loras)) {
    return true
  }

  return false
}

export default React.memo(LoraSelect, areEqual)
