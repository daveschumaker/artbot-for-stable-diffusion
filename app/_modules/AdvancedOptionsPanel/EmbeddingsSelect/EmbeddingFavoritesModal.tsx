/* eslint-disable @next/next/no-img-element */
import DropdownOptions from 'app/_modules/DropdownOptions'
import Overlay from 'app/_components/Overlay'
import React, { useState } from 'react'
import { Embedding } from 'types/civitai'
import Input from 'components/UI/Input'
import { Button } from 'components/UI/Button'
import { IconArrowBarLeft, IconSettings } from '@tabler/icons-react'
import styles from './component.module.css'
import Checkbox from 'components/UI/Checkbox'
import EmbeddingDetailsCard from './EmbeddingDetailsCard'
import AppSettings from 'models/AppSettings'

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
      <Overlay handleClose={handleClose} disableBackground />
      <DropdownOptions
        className={styles.Dropdown}
        handleClose={handleClose}
        title="Favorite Embeddings"
        maxWidth="unset"
        height={600}
        style={{ maxHeight: '600px' }}
      >
        <div
          style={{
            columnGap: '4px',
            display: 'flex',
            flexDirection: 'row',
            marginTop: '8px'
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
              top="80px"
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
        {filtered.length === 0 && (
          <div style={{ fontWeight: 400, marginTop: '8px' }}>
            No favorite models found.
          </div>
        )}
        {filtered.length >= 1 && (
          <div style={{ fontSize: '12px', fontWeight: 400, marginTop: '4px' }}>
            Showing {filtered.length} favorites
          </div>
        )}
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
              overflow: 'auto'
            }}
          >
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
      </DropdownOptions>
    </>
  )
}

export default EmbeddingFavoritesModal
