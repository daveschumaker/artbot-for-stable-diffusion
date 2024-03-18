/* eslint-disable @next/next/no-img-element */
import {
  IconDownload,
  IconExternalLink,
  IconHeart,
  IconHeartFilled
} from '@tabler/icons-react'
import Accordion from 'app/_components/Accordion'
import AccordionItem from 'app/_components/AccordionItem'
import FlexCol from 'app/_components/FlexCol'
import FlexRow from 'app/_components/FlexRow'
import Panel from 'app/_components/Panel'
import { Button } from 'app/_components/Button'
import Linker from 'app/_components/Linker'
import { sanitize } from 'isomorphic-dompurify'
import { useCallback, useState } from 'react'
import { Embedding, ModelVersion } from '_types/civitai'
import { handleConvertLora } from '../loraUtils'
import Select from 'app/_components/Select'

const isFavorite = (tiId: string) => {
  let existingArray = localStorage.getItem('favoriteEmbeddings')

  if (!existingArray) {
    return false
  }

  const result = JSON.parse(existingArray)
  const filter = result.filter((ti: any) => ti.id === tiId)

  if (filter.length > 0) {
    return true
  }

  return false
}

export default function LoraSearchDetailsCard({
  embedding,
  handleClose = () => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  handleAddLora = (lora: Embedding, version: ModelVersion) => {}
}: {
  embedding: Embedding
  handleClose: () => any
  handleAddLora: (lora: Embedding, version: ModelVersion) => any
}) {
  const [version, setVersion] = useState(embedding.modelVersions[0])
  const [favorited, setFavorited] = useState(isFavorite(embedding.id as string))

  const handleFavorite = (lora: Embedding, loraVersion: ModelVersion) => {
    // Need to cast data from default CivitAI shape to the silly shape I decided to use... for some reason.
    const loraDetails = handleConvertLora(embedding, loraVersion)

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

  const versionOptions = embedding.modelVersions.map((model, idx) => {
    return {
      idx,
      label: model.name,
      value: model.id
    }
  })

  const formatBaseline = (baseline: string) => {
    if (baseline === 'stable diffusion 1') {
      return `SD 1.5`
    } else if (baseline === 'stable diffusion 2') {
      return 'SD 2.0'
    } else if (baseline === 'stable_diffusion_xl') {
      return 'SDXL'
    } else {
      return baseline
    }
  }

  const getImage = useCallback(() => {
    let image = null
    const { modelVersions = [] } = embedding
    if (!version || !version.images || version.images.length === 0) {
      image = (
        <div
          style={{
            height: '140px',
            width: '140px',
            backgroundColor: 'gray'
          }}
        ></div>
      )
    } else if (version.images[0].url && version.images[0].type === 'image') {
      image = (
        <img
          alt="Example of LORA"
          src={version.images[0].url}
          style={{ maxHeight: '300px', maxWidth: '140px' }}
        />
      )
    } else if (
      modelVersions[0].images[0].url &&
      modelVersions[0].images[0].type === 'image'
    ) {
      image = (
        <img
          alt="Example of LORA"
          src={modelVersions[0].images[0].url}
          style={{ maxHeight: '300px', maxWidth: '140px' }}
        />
      )
    } else {
      image = (
        <div
          style={{
            height: '140px',
            width: '140px',
            backgroundColor: 'gray'
          }}
        ></div>
      )
    }

    return image
  }, [embedding, version])

  let modelUrl = `https://civitai.com/models/${embedding.id}`
  if (version && version.id) {
    modelUrl = `https://civitai.com/models/${embedding.id}?modelVersionId=${version.id}`
  }

  return (
    <Panel padding="8px" style={{ position: 'relative' }}>
      <FlexRow gap={12} style={{ alignItems: 'flex-start' }}>
        {getImage()}
        <FlexCol style={{ flex: 1 }}>
          <FlexCol style={{ flex: 1 }}>
            <div style={{ fontSize: '14px' }}>{embedding.name}</div>
            <div
              className="flex flex-row gap-2 items-center"
              style={{
                fontSize: '12px'
              }}
            >
              <Linker href={modelUrl} target="_blank" rel="noopener noreferrer">
                [ View on Civitai]
              </Linker>
              <IconExternalLink size={18} stroke={1.5} />
            </div>
          </FlexCol>
          {embedding.modelVersions.length >= 1 && (
            <FlexCol
              id={`model-version-${version.id}`}
              style={{ maxWidth: '280px' }}
            >
              <div className="text-xs mb-[4px] mt-[8px]">Version:</div>
              <div>
                <Select
                  maxMenuHeight={'120px'}
                  menuPlacement={'bottom'}
                  formatOptionLabel={(
                    option: any,
                    { context }: { context: any }
                  ) => {
                    if (context === 'menu') {
                      return (
                        <>
                          <div style={{ fontSize: '14px' }}>{option.label}</div>
                          <div style={{ fontSize: '10px' }}>
                            Baseline: {formatBaseline(version?.baseModel)}
                          </div>
                        </>
                      )
                    } else {
                      return <div>{option.label}</div>
                    }
                  }}
                  options={versionOptions}
                  onChange={(selectedModel: ModelVersion) => {
                    // @ts-ignore
                    setVersion(embedding.modelVersions[selectedModel.idx])
                  }}
                  value={{
                    label: version.name,
                    value: version.id as any
                  }}
                />
              </div>
            </FlexCol>
          )}
          {embedding.modelVersions.length >= 1 && (
            <div className="text-xs mt-[4px] mb-[8px]">
              Base model: {version.baseModel}
            </div>
          )}
          <FlexRow gap={4} style={{ marginBottom: '8px', marginTop: '4px' }}>
            <Button
              size="small"
              onClick={() => handleFavorite(embedding, version)}
            >
              {favorited ? (
                <IconHeartFilled stroke={1.5} />
              ) : (
                <IconHeart stroke={1.5} />
              )}
            </Button>
            <Button
              onClick={() => {
                handleAddLora(embedding, version)
                handleClose()
              }}
              size="small"
            >
              <IconDownload />
              Use LORA
            </Button>
          </FlexRow>
        </FlexCol>
      </FlexRow>
      {embedding.description && (
        <div style={{ marginTop: '8px' }}>
          <Accordion>
            <AccordionItem
              title={<span style={{ fontWeight: 400 }}>Description</span>}
            >
              <div
                className="flex flex-col gap-0 mb-2"
                style={{ marginTop: '8px' }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitize(embedding.description)
                  }}
                  style={{
                    backgroundColor: '#ababab',
                    borderRadius: '4px',
                    fontSize: '14px',
                    padding: '8px',
                    fontWeight: 400,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                />
              </div>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </Panel>
  )
}
