import React, { useCallback, useState } from 'react'
import MaxWidth from 'components/UI/MaxWidth'
import Section from 'components/UI/Section'
import SubSectionTitle from 'components/UI/SubSectionTitle'
import { GetSetPromptInput } from 'types'
import styles from './loraSelect.module.css'
import { Button } from 'components/UI/Button'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import NumericInputSlider from 'components/CreatePage/AdvancedOptionsPanel/NumericInputSlider'
import ChooseLoraModal from './ChooseLoraModal'

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
    (obj: any = {}) => {
      let i
      let value

      for (const key in obj) {
        i = Number(key)
        value = obj[key]
      }

      if (!i) {
        return
      }

      const lorasToUpdate = [...input.loras]
      lorasToUpdate[i].model = value

      setInput({ loras: lorasToUpdate })
    },
    [input.loras, setInput]
  )

  const renderLoras = useCallback(() => {
    const arr: any = []

    input.loras.forEach((lora, i) => {
      // Need to cast input to correct type
      const castInput = {
        [String(i)]: lora.model
      }

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
            <NumericInputSlider
              fullWidth
              label="LORA strength"
              from={0.05}
              to={1.0}
              step={0.05}
              input={castInput}
              setInput={handleUpdate}
              fieldName={String(i)}
            />
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
      <MaxWidth width="50%">
        <div
          style={{
            border: '1px solid rgb(126, 90, 108)',
            padding: '8px 16px',
            borderRadius: '4px'
          }}
        >
          <SubSectionTitle>Select LORAs</SubSectionTitle>
          <div className="mb-2 relative">
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
