import Overlay from 'components/UI/Overlay'
import { IconX } from '@tabler/icons-react'
import Input from 'components/UI/Input'
import { useCallback, useEffect, useState } from 'react'
import styles from './loraSelect.module.css'
import { ParsedLoraModel } from 'models/Loras'
import useLoraCache from './useLoraCache'

export let loraCache: Array<any> | null = null

const ChooseLoraModal = ({
  handleClose = () => {},
  handleAddLora = (lora: any) => lora
}) => {
  const [fetchLoras, lorasArray] = useLoraCache()
  const [filter, setFilter] = useState('')

  const renderLoraList = useCallback(() => {
    if (lorasArray.length === 0) {
      return
    }

    const arr: Array<any> = []

    let filteredLoras = lorasArray

    if (filter) {
      filteredLoras = lorasArray.filter((lora: ParsedLoraModel) => {
        return lora.displayName.toLowerCase().includes(filter.toLowerCase())
      })
    }

    filteredLoras.forEach((lora: ParsedLoraModel, i: number) => {
      arr.push(
        <div
          key={`lora_select_${i}`}
          className="mb-2 row cursor-pointer"
          onClick={() => {
            const idString = String(lora.id)
            handleAddLora(idString)
            handleClose()
          }}
        >
          {lora.displayName}
        </div>
      )
    })

    return arr
  }, [filter, handleAddLora, handleClose, lorasArray])

  useEffect(() => {
    if (lorasArray.length === 0) {
      fetchLoras()
    }
  }, [fetchLoras, lorasArray.length])

  return (
    <>
      <Overlay handleClose={handleClose} disableBackground />
      <div className={styles['lora-select-modal']}>
        <div className={styles['StyledClose']} onClick={handleClose}>
          <IconX stroke={1.5} />
        </div>
        <div className={styles['filter-preset']}>
          <Input
            className="mb-2"
            type="text"
            name="filterLoras"
            placeholder="Search LORAs"
            onChange={(e: any) => {
              setFilter(e.target.value)
            }}
            value={filter}
            width="100%"
          />
        </div>
        <div className={styles['lora-select-wrapper']}>{renderLoraList()}</div>
      </div>
    </>
  )
}

export default ChooseLoraModal
