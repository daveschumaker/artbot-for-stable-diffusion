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
import { useState } from 'react'
import { Embedding } from '_types/civitai'
import { handleSaveRecentEmbedding } from './saveRecentEmbeddings'

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

const formatBaseline = (baseline: string) => {
  if (!baseline) return 'Unknown'

  // Handle lowercase variations
  const lowerBaseline = baseline.toLowerCase()

  // SD 1.x variants
  if (lowerBaseline.includes('sd 1.4') || lowerBaseline.includes('sd1.4')) {
    return 'SD 1.4'
  } else if (
    lowerBaseline.includes('sd 1.5') ||
    lowerBaseline.includes('sd1.5') ||
    lowerBaseline === 'stable diffusion 1'
  ) {
    return 'SD 1.5'
  } else if (lowerBaseline.includes('sd 1.5 lcm')) {
    return 'SD 1.5 LCM'
  }

  // SD 2.x variants
  else if (
    lowerBaseline.includes('sd 2.0') ||
    lowerBaseline.includes('sd2.0') ||
    lowerBaseline === 'stable diffusion 2'
  ) {
    return 'SD 2.0'
  } else if (lowerBaseline.includes('sd 2.0 768')) {
    return 'SD 2.0 768'
  } else if (
    lowerBaseline.includes('sd 2.1') ||
    lowerBaseline.includes('sd2.1')
  ) {
    return 'SD 2.1'
  } else if (lowerBaseline.includes('sd 2.1 768')) {
    return 'SD 2.1 768'
  } else if (lowerBaseline.includes('sd 2.1 unclip')) {
    return 'SD 2.1 Unclip'
  }

  // SDXL variants
  else if (lowerBaseline.includes('sdxl 0.9')) {
    return 'SDXL 0.9'
  } else if (lowerBaseline.includes('sdxl 1.0 lcm')) {
    return 'SDXL 1.0 LCM'
  } else if (
    lowerBaseline.includes('sdxl 1.0') ||
    lowerBaseline === 'stable_diffusion_xl' ||
    lowerBaseline === 'sdxl'
  ) {
    return 'SDXL 1.0'
  } else if (lowerBaseline.includes('sdxl turbo')) {
    return 'SDXL Turbo'
  } else if (lowerBaseline.includes('sdxl distilled')) {
    return 'SDXL Distilled'
  }

  // Pony
  else if (lowerBaseline.includes('pony')) {
    return 'Pony'
  }

  // Flux variants
  else if (
    lowerBaseline.includes('flux.1 s') ||
    lowerBaseline.includes('flux 1 s')
  ) {
    return 'Flux.1 S'
  } else if (
    lowerBaseline.includes('flux.1 d') ||
    lowerBaseline.includes('flux 1 d')
  ) {
    return 'Flux.1 D'
  } else if (lowerBaseline.includes('flux')) {
    return 'Flux'
  }

  // NoobAI
  else if (lowerBaseline.includes('noobai')) {
    return 'NoobAI'
  }

  // Illustrious
  else if (lowerBaseline.includes('illustrious')) {
    return 'Illustrious'
  }

  // Other known formats
  else if (lowerBaseline.includes('playground v2')) {
    return 'Playground v2'
  } else if (lowerBaseline.includes('pixart')) {
    return 'PixArt α'
  } else if (lowerBaseline.includes('svd xt')) {
    return 'SVD XT'
  } else if (lowerBaseline.includes('svd')) {
    return 'SVD'
  }

  // Default: return original if no match
  else {
    return baseline
  }
}

export default function EmbeddingDetailsCard({
  embedding,
  handleClose = () => {},
  handleAddEmbedding = (value: any) => value
}: {
  embedding: Embedding
  handleClose: () => any
  handleAddEmbedding: (value: any) => any
}) {
  const [favorited, setFavorited] = useState(isFavorite(embedding.id as string))
  const hasImage =
    embedding.modelVersions &&
    embedding.modelVersions[0] &&
    embedding.modelVersions[0].images.length > 0

  const handleFavorite = (ti: any) => {
    // Check if the local storage already has an array stored
    let existingArray = localStorage.getItem('favoriteEmbeddings')
    let newArray

    if (existingArray) {
      // Parse the existing array from the local storage
      newArray = JSON.parse(existingArray)

      // Check if the object with the same id already exists in the array
      const existingObjectIndex = newArray.findIndex(
        (obj: any) => obj.id === ti.id
      )

      if (existingObjectIndex !== -1) {
        // Remove the existing object from the array
        newArray.splice(existingObjectIndex, 1)
        setFavorited(false)
      } else {
        // Add the object to the front of the array
        newArray.unshift(ti)
        setFavorited(true)
      }
    } else {
      // Create a new array with the object
      newArray = [ti]
      setFavorited(true)
    }

    // Store the updated array back in the local storage
    localStorage.setItem('favoriteEmbeddings', JSON.stringify(newArray))
  }

  return (
    <Panel padding="8px">
      <FlexRow gap={12} style={{ alignItems: 'flex-start' }}>
        {!hasImage && (
          <div
            style={{
              height: '140px',
              width: '140px',
              backgroundColor: 'gray'
            }}
          ></div>
        )}
        {hasImage && (
          <img
            alt="Example of embedding"
            src={embedding.modelVersions[0].images[0].url}
            style={{ maxHeight: '300px', maxWidth: '140px' }}
          />
        )}
        <FlexCol style={{ flex: 1 }}>
          <FlexCol style={{ flex: 1 }}>
            <div style={{ fontSize: '14px' }}>{embedding.name}</div>
            <div
              className="flex flex-row gap-2 items-center"
              style={{
                fontSize: '12px'
              }}
            >
              <Linker
                href={`https://civitai.com/models/${embedding.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                [ View on Civitai]
              </Linker>
              <IconExternalLink size={18} stroke={1.5} />
            </div>
            {embedding.modelVersions.length >= 1 && (
              <div style={{ fontSize: '14px', fontWeight: 400 }}>
                Base model:{' '}
                {formatBaseline(embedding.modelVersions[0].baseModel)}
              </div>
            )}
          </FlexCol>
          <FlexRow gap={4} style={{ marginBottom: '8px', marginTop: '4px' }}>
            <Button size="small" onClick={() => handleFavorite(embedding)}>
              {favorited ? (
                <IconHeartFilled stroke={1.5} />
              ) : (
                <IconHeart stroke={1.5} />
              )}
            </Button>
            <Button
              onClick={() => {
                handleAddEmbedding(embedding)
                handleSaveRecentEmbedding(embedding)
                handleClose()
              }}
              size="small"
            >
              <IconDownload />
              Use Embedding
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
