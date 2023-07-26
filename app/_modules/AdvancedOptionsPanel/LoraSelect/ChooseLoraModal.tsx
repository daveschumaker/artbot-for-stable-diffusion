/* eslint-disable @next/next/no-img-element */
import Overlay from 'app/_components/Overlay'
import { IconCloudSearch, IconHeart, IconHistory } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import Tabs from 'components/UI/Tabs'
import Tab from 'components/UI/Tab'
import LoadLora from './LoadLoraFromCivitai'
import FavoriteLoras from './FavoriteLoras'
import RecentLoras from './RecentLoras'
import DropdownOptions from 'app/_modules/DropdownOptions'

export let loraCache: Array<any> | null = null

let tempCache: any = null

const ChooseLoraModal = ({
  handleClose = () => {},
  handleAddLora = (lora: any) => lora
}) => {
  const [activeTab, setActiveTab] = useState('load')

  const cacheLoaded = (lora: any) => {
    tempCache = Object.assign({}, lora)
  }

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

  useEffect(() => {
    return () => {
      tempCache = null
    }
  }, [])

  return (
    <>
      <Overlay handleClose={handleClose} disableBackground />
      <DropdownOptions handleClose={handleClose} title="Load LoRA">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: '16px'
          }}
        >
          <div>
            <Tabs>
              <Tab
                activeTab={activeTab === 'load'}
                label={
                  <div className="flex flex-row items-center gap-2">
                    <IconCloudSearch /> Load
                  </div>
                }
                onClick={() => setActiveTab('load')}
              />
              <Tab
                activeTab={activeTab === 'favorites'}
                label={
                  <div className="flex flex-row items-center gap-2">
                    <IconHeart /> Favorites
                  </div>
                }
                onClick={() => setActiveTab('favorites')}
              />
              <Tab
                activeTab={activeTab === 'recents'}
                label={
                  <div className="flex flex-row items-center gap-2">
                    <IconHistory /> Recent
                  </div>
                }
                onClick={() => setActiveTab('recents')}
              />
            </Tabs>
          </div>
          {activeTab === 'load' && (
            <LoadLora
              handleAddLora={handleAddLora}
              handleClose={handleClose}
              handleSaveRecent={handleSaveRecent}
              cacheLoaded={cacheLoaded}
              tempCache={tempCache}
            />
          )}
          {activeTab === 'favorites' && (
            <div
              style={{
                height: '320px',
                overflow: 'scroll',
                position: 'relative'
              }}
            >
              <FavoriteLoras
                handleAddLora={handleAddLora}
                handleClose={handleClose}
                handleSaveRecent={handleSaveRecent}
              />
            </div>
          )}
          {activeTab === 'recents' && (
            <div
              style={{
                height: '320px',
                overflow: 'scroll',
                position: 'relative'
              }}
            >
              <RecentLoras
                handleAddLora={handleAddLora}
                handleClose={handleClose}
                handleSaveRecent={handleSaveRecent}
              />
            </div>
          )}
        </div>
      </DropdownOptions>
    </>
  )
}

export default ChooseLoraModal
