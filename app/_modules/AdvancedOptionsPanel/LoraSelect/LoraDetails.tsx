/* eslint-disable @next/next/no-img-element */
import { sanitize } from 'isomorphic-dompurify'
import { IconDownload, IconHeart, IconHeartFilled } from '@tabler/icons-react'
import { Button } from 'app/_components/Button'
import Panel from 'app/_components/Panel'
import { useState } from 'react'
import Accordion from 'app/_components/Accordion'
import AccordionItem from 'app/_components/AccordionItem'
import { SavedLora } from '_types/artbot'

const isFavorite = (loraName: string) => {
  let existingArray = localStorage.getItem('favoriteLoras')

  if (!existingArray) {
    return false
  }

  const result = JSON.parse(existingArray)
  const filter = result.filter((lora: any) => lora.name === loraName)

  if (filter.length > 0) {
    return true
  }

  return false
}

const LoraDetails = ({
  fullHeight = true,
  loraDetails,
  handleAddLora = (lora: any) => lora,
  handleClose = () => {},
  handleSaveRecent = (lora: any) => lora
}: {
  fullHeight?: boolean
  loraDetails: SavedLora
  handleAddLora: (lora: any) => void
  handleClose: () => void
  handleSaveRecent: (lora: any) => void
}) => {
  const [favorited, setFavorited] = useState(
    isFavorite(loraDetails.name as string)
  )
  const handleFavorite = (loraDetails: any) => {
    // Check if the local storage already has an array stored
    let existingArray = localStorage.getItem('favoriteLoras')
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
        setFavorited(false)
      } else {
        // Add the object to the front of the array
        newArray.unshift(loraDetails)
        setFavorited(true)
      }
    } else {
      // Create a new array with the object
      newArray = [loraDetails]
      setFavorited(true)
    }

    // Store the updated array back in the local storage
    localStorage.setItem('favoriteLoras', JSON.stringify(newArray))
  }

  return (
    <Panel padding="8px">
      <div className="flex flex-col gap-2">
        <strong>{loraDetails.label}</strong>
        <div className="flex flex-row gap-4 w-full">
          {loraDetails.image && (
            <img
              alt="Example output image"
              src={loraDetails.image}
              style={{
                maxWidth: '120px',
                height: 'auto',
                maxHeight: '120px'
              }}
            />
          )}
          <div
            className="flex flex-col gap-2"
            style={{
              height: fullHeight ? '100%' : '320px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div className="flex flex-row gap-2 items-center">
              <Button size="small" onClick={() => handleFavorite(loraDetails)}>
                {favorited ? <IconHeartFilled /> : <IconHeart />}
              </Button>
              <Button
                size="small"
                onClick={() => {
                  handleSaveRecent(loraDetails)
                  handleAddLora(loraDetails)
                  handleClose()
                }}
                width="100px"
              >
                <IconDownload />
                Use
              </Button>
            </div>
            <div
              style={{
                height: '100%',
                overflowY: 'auto'
              }}
            >
              {loraDetails.versionLabel && (
                <div className="flex flex-col gap-0">
                  <div>
                    <strong>Version:</strong>
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    {loraDetails.versionLabel}
                  </div>
                </div>
              )}
              {loraDetails.baseModel && (
                <div className="flex flex-col gap-0">
                  <div>
                    <strong>Base model:</strong>
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    {loraDetails.baseModel}
                  </div>
                </div>
              )}
              {loraDetails.trainedWords && (
                <div className="flex flex-col gap-0">
                  <div>
                    <strong>Trained words:</strong>
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    {loraDetails.trainedWords.join(', ')}
                  </div>
                </div>
              )}
              {loraDetails.description && (
                <Accordion>
                  <AccordionItem title={<strong>Description</strong>}>
                    <div className="flex flex-col gap-0 mb-2">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: sanitize(loraDetails.description)
                        }}
                        style={{ fontSize: '14px' }}
                      />
                    </div>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}

export default LoraDetails
