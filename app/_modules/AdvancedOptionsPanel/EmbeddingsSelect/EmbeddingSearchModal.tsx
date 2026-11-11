import DropdownOptions from 'app/_modules/DropdownOptions'
import React, { useState } from 'react'
import FlexCol from 'app/_components/FlexCol'
import Input from 'app/_components/Input'
import { Button } from 'app/_components/Button'
import { IconArrowBarLeft, IconSettings } from '@tabler/icons-react'
import styles from './component.module.css'
import Checkbox from 'app/_components/Checkbox'
import EmbeddingDetailsCard from './EmbeddingDetailsCard'
import AppSettings from 'app/_data-models/AppSettings'
import SpinnerV2 from 'app/_components/Spinner'
import { useCivitaiSearch } from 'app/_hooks/useCivitaiSearch'

const EmbeddingSearchModal = ({
  handleClose = () => {},
  handleAddEmbedding = (value: any) => value
}) => {
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)
  const [showNsfw, setShowNsfw] = useState(AppSettings.get('civitaiShowNsfw'))
  const [showSDXL, setShowSDXL] = useState(AppSettings.get('civitaiShowSDXL'))
  const [showSD15, setShowSD15] = useState(AppSettings.get('civitaiShowSD15'))
  const [showSD21, setShowSD21] = useState(AppSettings.get('civitaiShowSD21'))
  const [showPony, setShowPony] = useState(AppSettings.get('civitaiShowPony'))
  const [showNoobAI, setShowNoobAI] = useState(
    AppSettings.get('civitaiShowNoobAI')
  )
  const [showIllustrious, setShowIllustrious] = useState(
    AppSettings.get('civitaiShowIllustrious')
  )
  const [showFlux, setShowFlux] = useState(AppSettings.get('civitaiShowFlux'))
  const [input, setInput] = useState<string>('')

  const search = useCivitaiSearch(
    'embedding',
    {
      input,
      nsfw: !!showNsfw,
      sd15: !!showSD15,
      sd21: !!showSD21,
      sdxl: !!showSDXL,
      pony: !!showPony,
      flux: !!showFlux,
      noob: !!showNoobAI,
      illu: !!showIllustrious
    },
    { requireInput: true }
  )

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

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
              placeholder="Search CivitAI for embeddings"
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
                <div style={{ padding: '8px 0' }}>
                  <Checkbox
                    label="Show SDXL embeddings?"
                    checked={showSDXL}
                    onChange={(bool: boolean) => {
                      AppSettings.set('civitaiShowSDXL', bool)
                      setShowSDXL(bool)
                    }}
                  />
                </div>
                <div style={{ padding: '8px 0' }}>
                  <Checkbox
                    label="Show SD15 embeddings?"
                    checked={showSD15}
                    onChange={(bool: boolean) => {
                      AppSettings.set('civitaiShowSD15', bool)
                      setShowSD15(bool)
                    }}
                  />
                </div>
                <div style={{ padding: '8px 0' }}>
                  <Checkbox
                    label="Show SD21 embeddings?"
                    checked={showSD21}
                    onChange={(bool: boolean) => {
                      AppSettings.set('civitaiShowSD21', bool)
                      setShowSD21(bool)
                    }}
                  />
                </div>
                <div style={{ padding: '8px 0' }}>
                  <Checkbox
                    label="Show Pony embeddings?"
                    checked={showPony}
                    onChange={(bool: boolean) => {
                      AppSettings.set('civitaiShowPony', bool)
                      setShowPony(bool)
                    }}
                  />
                </div>
                <div style={{ padding: '8px 0' }}>
                  <Checkbox
                    label="Show Flux embeddings?"
                    checked={showFlux}
                    onChange={(bool: boolean) => {
                      AppSettings.set('civitaiShowFlux', bool)
                      setShowFlux(bool)
                    }}
                  />
                </div>
                <div style={{ padding: '8px 0' }}>
                  <Checkbox
                    label="Show NoobAI embeddings?"
                    checked={showNoobAI}
                    onChange={(bool: boolean) => {
                      AppSettings.set('civitaiShowNoobAI', bool)
                      setShowNoobAI(bool)
                    }}
                  />
                </div>
                <div style={{ padding: '8px 0' }}>
                  <Checkbox
                    label="Show Illustrious embeddings?"
                    checked={showIllustrious}
                    onChange={(bool: boolean) => {
                      AppSettings.set('civitaiShowIllustrious', bool)
                      setShowIllustrious(bool)
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
            {!input.trim() && <div>Enter a search term to begin...</div>}
            {search.isError && (
              <div style={{ fontWeight: 400, marginTop: '8px' }}>
                Unable to load data from CivitAI, please try again shortly.
              </div>
            )}
            {search.enabled &&
              !search.isSearching &&
              !search.isError &&
              search.items.length === 0 && (
                <div style={{ fontWeight: 400, marginTop: '8px' }}>
                  No matches found. Please try a different search.
                </div>
              )}
            {search.isSearching && (
              <FlexCol
                gap={12}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '24px'
                }}
              >
                <SpinnerV2 />
                <div style={{ fontSize: '12px', fontWeight: '400' }}>
                  Loading remote data from CivitAI...
                </div>
              </FlexCol>
            )}
            {!search.isSearching &&
              search.items.map((item) => {
                return (
                  <EmbeddingDetailsCard
                    key={`ti_${item.id}`}
                    embedding={item}
                    handleAddEmbedding={handleAddEmbedding}
                    handleClose={handleClose}
                  />
                )
              })}
            {!search.isSearching && search.hasMore && (
              <div className={styles.LoadMore}>
                <Button
                  disabled={search.isLoadingMore}
                  onClick={() => search.loadMore()}
                >
                  {search.isLoadingMore ? 'Loading...' : 'Load more'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </FlexCol>
    </>
  )
}

export default EmbeddingSearchModal
