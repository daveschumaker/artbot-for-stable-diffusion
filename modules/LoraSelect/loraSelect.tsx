import React, { useCallback, useState } from 'react'
import MaxWidth from 'components/UI/MaxWidth'
import Section from 'components/UI/Section'
import SubSectionTitle from 'components/UI/SubSectionTitle'
import { GetSetPromptInput } from 'types'
import styles from './loraSelect.module.css'
import { Button } from 'components/UI/Button'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import ChooseLoraModal from './ChooseLoraModal'
import NumberInput from 'components/UI/NumberInput'
import Slider from 'components/UI/Slider'

const LoraSelect = ({ input, setInput }: GetSetPromptInput) => {
  const [showModal, setShowModal] = useState(false)

  console.log(`input.loras??`, input.loras)

  const handleAddLora = (name: string = '') => {
    const lorasToUpdate = [...input.loras]
    lorasToUpdate.push({
      name,
      model: 1,
      clip: 1
    })

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

    input.loras.forEach((lora, i) => {
      // Need to cast input to correct type
      console.log(`lora.model??`, lora.model)

      arr.push(
        <div
          className={styles['lora-model-box']}
          key={`lora_${lora.name}_${i}`}
        >
          <div className={styles['lora-name']}>
            {lora.name}
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
                  LORA strength
                  <div className="block text-xs w-full">
                    ({0.5} - {1})
                  </div>
                </SubSectionTitle>
                <NumberInput
                  className="mb-2"
                  type="text"
                  min={0.5}
                  max={1}
                  step={0.05}
                  onMinusClick={() => {
                    handleUpdate(i, Number((lora.model - 0.05).toFixed(2)))
                  }}
                  onPlusClick={() => {
                    handleUpdate(i, Number((lora.model + 0.05).toFixed(2)))
                  }}
                  onChange={(e: any) => {
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
                min={0.5}
                max={1}
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
                    <div style={{ fontWeight: 400, fontSize: '14px' }}>
                      (Don&apos;t forget to add one of these to your prompt)
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

    return arr
  }, [handleDeleteLora, handleUpdate, input.loras])

  return (
    <Section>
      <MaxWidth width="512px">
        <div
          style={{
            border: '1px solid rgb(126, 90, 108)',
            padding: '8px 16px',
            borderRadius: '4px'
          }}
        >
          <SubSectionTitle>Select LORAs</SubSectionTitle>
          <div
            className="mb-2 relative"
            style={{
              marginBottom: '12px'
            }}
          >
            <Button size="small" onClick={() => setShowModal(true)}>
              <IconPlus /> Add LORA
            </Button>
            {showModal && (
              <ChooseLoraModal
                handleClose={() => setShowModal(false)}
                handleAddLora={handleAddLora}
              />
            )}
          </div>
          <MaxWidth width="480px">{renderLoras()}</MaxWidth>
        </div>
      </MaxWidth>
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
