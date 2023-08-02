import { useState } from 'react'
import LoraDetails from './LoraDetails'

const loadFromLocalStorage = () => {
  let existingArray = localStorage.getItem('recentLoras')

  if (existingArray) {
    // Parse the existing array from the local storage
    return JSON.parse(existingArray)
  }

  return false
}

const RecentLoras = ({
  handleAddLora = (lora: any) => lora,
  handleClose = () => {},
  handleSaveRecent = (lora: any) => lora
}) => {
  const [recentLoras] = useState(loadFromLocalStorage())
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
      {!recentLoras && <span>You have no recently used LoRAs, yet!</span>}
      {recentLoras &&
        recentLoras.map((loraDetails: any) => {
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

export default RecentLoras
