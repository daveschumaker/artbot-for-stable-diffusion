/* eslint-disable @next/next/no-img-element */
import DropdownOptions from 'app/_modules/DropdownOptions'
import React, { useState } from 'react'
import { Embedding } from '_types/civitai'
import Input from 'app/_components/Input'
import { Button } from 'app/_components/Button'
import { IconArrowBarLeft, IconSettings } from '@tabler/icons-react'
import styles from './component.module.css'
import Checkbox from 'app/_components/Checkbox'
import EmbeddingDetailsCard from './EmbeddingDetailsCard'
import AppSettings from 'app/_data-models/AppSettings'
import FlexCol from 'app/_components/FlexCol'

const loadFromLocalStorage = () => {
  let existingArray = localStorage.getItem('favoriteEmbeddings')

  if (existingArray) {
    try {
      // Parse the existing array from the local storage
      return JSON.parse(existingArray)
    } catch (err) {
      return []
    }
  }

  return []
}

const EmbeddingFavoritesModal = ({
  handleClose = () => {},
  handleAddEmbedding = (value: any) => value
}) => {
  const [favoriteEmbeddings] = useState(loadFromLocalStorage())
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)
  const [showNsfw, setShowNsfw] = useState<boolean>(
    AppSettings.get('civitaiShowNsfw')
  )
  const [input, setInput] = useState<string>('')

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setInput(event.target.value)
  }

  const filtered = favoriteEmbeddings.filter((ti: Embedding) => {
    const nsfwStatus = ti.nsfw === false || ti.nsfw === showNsfw
    return ti.name.toLowerCase().includes(input.toLowerCase()) && nsfwStatus
  })

  return (
    <>
      <FlexCol mt={-1}>
        <FlexCol>
          <div
            style={{
              backgroundColor: 'var(--modal-background)',
              columnGap: '4px',
              display: 'flex',
              flexDirection: 'row',
              paddingBottom: '8px',
              paddingTop: '8px',
              position: 'absolute',
              left: '16px',
              right: '16px',
              zIndex: 1
            }}
          >
            <Input
              type="text"
              name="filterEmbeddings"
              placeholder="Search your favorite embeddings"
              onChange={handleInputChange}
              value={input}
              width="100%"
            />
            <Button
              onClick={() => {
                setInput('')
              }}
              theme="secondary"
            >
              <IconArrowBarLeft />
            </Button>
            <Button onClick={() => setShowOptionsMenu(true)}>
              <IconSettings />
            </Button>
            {showOptionsMenu && (
              <DropdownOptions
                handleClose={() => setShowOptionsMenu(false)}
                title="Embedding Search Options"
                top="12px"
                maxWidth="280px"
                style={{
                  left: 'unset',
                  right: 0,
                  top: '56px'
                }}
              >
                <div style={{ padding: '8px 0' }}>
                  <Checkbox
                    label="Show NSFW embeddings?"
                    checked={showNsfw}
                    onChange={(bool: boolean) => {
                      AppSettings.set('civitaiShowNsfw', bool)
                      setShowNsfw(bool)
                    }}
                  />
                </div>
              </DropdownOptions>
            )}
          </div>
        </FlexCol>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: '4px'
          }}
        >
          <div
            className={styles.SearchResultsWrapper}
            id="embedded-search-results"
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              marginTop: '46px',
              marginBottom: '40px',
              overflow: 'auto'
            }}
          >
            {filtered.length === 0 && (
              <div style={{ fontWeight: 400, marginTop: '8px' }}>
                No favorite models found.
              </div>
            )}
            {filtered.length >= 1 && (
              <div
                style={{ fontSize: '12px', fontWeight: 400, marginTop: '4px' }}
              >
                Showing {filtered.length} favorites
              </div>
            )}
            {filtered.map((item: Embedding) => {
              return (
                <EmbeddingDetailsCard
                  key={`ti_${item.id}`}
                  embedding={item}
                  handleAddEmbedding={handleAddEmbedding}
                  handleClose={handleClose}
                />
              )
            })}
          </div>
        </div>
      </FlexCol>
    </>
  )
}

export default EmbeddingFavoritesModal
