import Overlay from 'components/UI/Overlay'
import { IconX } from '@tabler/icons-react'
import Input from 'components/UI/Input'
import { useCallback, useEffect, useState } from 'react'
import styles from './loraSelect.module.css'
import { ParsedLoraModel } from 'models/Loras'

let loraCache: Array<any> | null = null

const ChooseLoraModal = ({
  handleClose = () => {},
  handleAddLora = (lora: any) => lora
}) => {
  const [loras, setLoras] = useState([])
  const [filter, setFilter] = useState('')

  console.log(`data`, loras)

  const renderLoraList = useCallback(() => {
    if (loras.length === 0) {
      return
    }

    const arr: Array<any> = []

    let filteredLoras = loras

    if (filter) {
      filteredLoras = loras.filter((lora: ParsedLoraModel) => {
        return lora.displayName.toLowerCase().includes(filter.toLowerCase())
      })
    }

    filteredLoras.forEach((lora: ParsedLoraModel, i) => {
      arr.push(
        <div
          key={`lora_select_${i}`}
          className="mb-2 row cursor-pointer"
          onClick={() => {
            handleAddLora(lora.name)
            handleClose()
          }}
        >
          {lora.displayName}
        </div>
      )
    })

    return arr
  }, [filter, handleAddLora, handleClose, loras])

  const fetchLoras = async () => {
    if (loraCache !== null) {
      setLoras(loraCache)
      return
    }

    const res = await fetch('/artbot/api/get-lora-models')
    const json = await res.json()

    const { data } = json

    if (data) {
      loraCache = [...data]
      setLoras(data)
    }
  }

  useEffect(() => {
    fetchLoras()
  }, [])

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
