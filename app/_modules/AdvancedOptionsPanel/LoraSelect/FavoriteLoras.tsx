import { useState } from 'react'
import LoraDetails from './LoraDetails'

const loadFromLocalStorage = () => {
  let existingArray = localStorage.getItem('favoriteLoras')

  if (existingArray) {
    // Parse the existing array from the local storage
    return JSON.parse(existingArray)
  }

  return false
}

const FavoriteLoras = ({
  handleAddLora = (lora: any) => lora,
  handleClose = () => {},
  handleSaveRecent = (lora: any) => lora
}) => {
  const [favoriteLoras] = useState(loadFromLocalStorage())
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: '8px',
        margin: '16px',
        overflowY: 'auto'
      }}
    >
      {!favoriteLoras && <span>You have no favorite LoRAs, yet!</span>}
      {favoriteLoras &&
        favoriteLoras.map((loraDetails: any) => {
          return (
            <LoraDetails
              key={loraDetails.name}
              loraDetails={loraDetails}
              handleAddLora={handleAddLora}
              handleClose={handleClose}
              handleSaveRecent={handleSaveRecent}
            />
          )
        })}
    </div>
  )
}

export default FavoriteLoras
