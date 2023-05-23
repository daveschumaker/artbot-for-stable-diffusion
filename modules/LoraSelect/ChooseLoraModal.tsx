import Overlay from 'components/UI/Overlay'
import { IconX } from '@tabler/icons-react'
import Input from 'components/UI/Input'
import { useCallback, useState } from 'react'
import styles from './loraSelect.module.css'
import Loras from 'models/Loras'

const ChooseLoraModal = ({
  handleClose = () => {},
  handleAddLora = () => {}
}) => {
  const data = Loras.getModels()
  const [filter, setFilter] = useState('')

  const renderLoraList = useCallback(() => {
    const arr: Array<any> = []

    let filteredLoras = data

    if (filter) {
      filteredLoras = data.filter((lora) => {
        return lora.displayName.toLowerCase().includes(filter.toLowerCase())
      })
    }

    filteredLoras.forEach((lora, i) => {
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
  }, [data, filter])

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
