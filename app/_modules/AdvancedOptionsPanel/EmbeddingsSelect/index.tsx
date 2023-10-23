import { IconHeart, IconHistory, IconPlus } from '@tabler/icons-react'
import FlexRow from 'app/_components/FlexRow'
import Section from 'app/_components/Section'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import { Button } from 'app/_components/Button'
import { useCallback } from 'react'
import EmbeddingSearchModal from './EmbeddingSearchModal'
import EmbeddingSettingsCard from './EmbeddingSettingsCard'
import FlexCol from 'app/_components/FlexCol'
import { AiHordeEmbedding } from '_types/artbot'
import EmbeddingFavoritesModal from './EmbeddingFavoritesModal'
import EmbeddingRecentsModal from './EmbeddingRecentsModal'
import { InjectTi } from '_types/horde'
import { useModal } from '@ebay/nice-modal-react'
import AwesomeModalWrapper from 'app/_modules/AwesomeModal'
import { useInput } from 'app/_modules/InputProvider/context'

// Search / display TI / Textual Inversion Embeddings from Civitai
export default function EmbeddingsSelect() {
  const { input, setInput } = useInput()
  const embeddingsModal = useModal(AwesomeModalWrapper)

  const handleAddEmbedding = (tiDetails: AiHordeEmbedding) => {
    const tisToUpdate = [...input.tis]

    const exists = tisToUpdate.filter((ti) => ti.name === tiDetails.name)

    if (exists.length > 0) {
      return
    }

    tisToUpdate.push(
      Object.assign({}, tiDetails, {
        strength: 1,
        inject_ti: InjectTi.Prompt
      })
    )

    setInput({ tis: [...tisToUpdate] })
  }

  const handleDeleteTi = useCallback(
    (i: number) => {
      const tisToUpdate = [...input.tis].filter((ti, idx) => i !== idx)
      setInput({ tis: [...tisToUpdate] })
    },
    [input.tis, setInput]
  )

  const handleUpdate = useCallback(
    (i: number, key: string, value: number | string) => {
      if (!i && i !== 0) {
        return
      }

      const tisToUpdate = [...input.tis]
      // @ts-ignore
      tisToUpdate[Number(i)][key] = value

      setInput({ tis: [...tisToUpdate] })
    },
    [input.tis, setInput]
  )

  const renderTis = useCallback(() => {
    const arr: any = []

    if (!input.tis || !Array.isArray(input.tis)) {
      return null
    }

    input.tis.forEach((ti: AiHordeEmbedding, i: number) => {
      arr.push(
        <EmbeddingSettingsCard
          key={`ti_${ti.id}`}
          embedding={ti}
          handleDelete={() => handleDeleteTi(i)}
          handleUpdate={(key: string, value: number | string) =>
            handleUpdate(i, key, value)
          }
        />
      )
    })

    if (arr.length === 0) {
      return null
    }

    return arr
  }, [handleDeleteTi, handleUpdate, input.tis])

  return (
    <Section>
      <div
        style={{
          border: '1px solid rgb(126, 90, 108)',
          padding: '8px 16px',
          borderRadius: '4px'
        }}
      >
        <SubSectionTitle pb={0}>
          <FlexRow
            style={{
              columnGap: '8px',
              justifyContent: 'space-between',
              position: 'relative',
              width: 'auto'
            }}
          >
            <div>Textual Inversions</div>
            <FlexRow
              gap={4}
              style={{ justifyContent: 'flex-end', width: 'auto' }}
            >
              <Button
                size="small"
                onClick={() => {
                  embeddingsModal.show({
                    children: (
                      <EmbeddingSearchModal
                        handleAddEmbedding={handleAddEmbedding}
                      />
                    ),
                    label: 'Search Embeddings'
                  })
                }}
                // disabled={input.loras.length >= 5}
              >
                <IconPlus stroke={1.5} />
              </Button>
              <Button
                size="small"
                onClick={() => {
                  embeddingsModal.show({
                    children: (
                      <EmbeddingFavoritesModal
                        handleAddEmbedding={handleAddEmbedding}
                      />
                    ),
                    label: 'Favorite Embeddings'
                  })
                }}
                // disabled={input.loras.length >= 5}
              >
                <IconHeart stroke={1.5} />
              </Button>
              <Button
                size="small"
                onClick={() => {
                  embeddingsModal.show({
                    children: (
                      <EmbeddingRecentsModal
                        handleAddEmbedding={handleAddEmbedding}
                      />
                    ),
                    label: 'Recently Used Embeddings'
                  })
                }}
                // disabled={input.loras.length >= 5}
              >
                <IconHistory stroke={1.5} />
              </Button>
            </FlexRow>
          </FlexRow>
        </SubSectionTitle>
        {Array.isArray(input.tis) && input.tis.length > 0 && (
          <FlexCol gap={8} mb={0} mt={8}>
            {renderTis()}
          </FlexCol>
        )}
      </div>
    </Section>
  )
}
