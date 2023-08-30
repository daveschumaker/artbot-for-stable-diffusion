/* eslint-disable @next/next/no-img-element */
import DropdownOptions from 'app/_modules/DropdownOptions'
import Overlay from 'app/_components/Overlay'
import React, { useCallback, useEffect, useState } from 'react'
import { Embedding } from 'types/civitai'
import FlexCol from 'app/_components/FlexCol'
import Input from 'components/UI/Input'
import SpinnerV2 from 'components/Spinner'
import { Button } from 'components/UI/Button'
import { IconArrowBarLeft, IconSettings } from '@tabler/icons-react'
import ReactPaginate from 'react-paginate'
import styles from './component.module.css'
import Checkbox from 'components/UI/Checkbox'
import EmbeddingDetailsCard from './EmbeddingDetailsCard'
import AppSettings from 'models/AppSettings'

const debounce = (func: (str: string) => Promise<any>, delay: number) => {
  let timerId: any

  return (...args: any) => {
    clearTimeout(timerId)
    return new Promise((resolve) => {
      timerId = setTimeout(() => {
        resolve(func.apply(null, args))
      }, delay)
    })
  }
}

const LIMIT = 20

let pendingRequest = false
// API reference: https://github.com/civitai/civitai/wiki/REST-API-Reference
const searchRequest = async ({
  input,
  page = 1,
  nsfw = false
}: {
  input?: string
  page?: number
  nsfw?: boolean
}) => {
  try {
    if (pendingRequest) return false

    pendingRequest = true

    const controller = new AbortController()
    const signal = controller.signal

    const query = input ? `&query=${input}` : ''

    const timeout = setTimeout(() => {
      controller.abort()
      pendingRequest = false
      console.error('Request timed out')
    }, 5000) // Change the timeout duration as needed

    const response = await fetch(
      `https://civitai.com/api/v1/models?types=TextualInversion&sort=Highest Rated&limit=${LIMIT}${query}&page=${page}&nsfw=${nsfw}`,
      { signal }
    )
    clearTimeout(timeout)

    const data = await response.json()
    const { items = [], metadata = {} } = data
    pendingRequest = false
    return { items, metadata }
  } catch (error) {
    console.error('Error fetching models:', error)
    pendingRequest = false
    return { items: [], metadata: {} }
  }
}

// @ts-ignore
const debouncedSearchRequest = debounce(searchRequest, 500)

const EmbeddingSearchModal = ({
  handleClose = () => {},
  handleAddEmbedding = (value: any) => value
}) => {
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)
  const [showNsfw, setShowNsfw] = useState(AppSettings.get('civitaiShowNsfw'))
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(-1) // Setting 0 here causes brief flash between loading finished and totalItems populated
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchResult, setSearchResult] = useState<Embedding[] | null>(null)
  const [input, setInput] = useState<string>('')

  const debouncedFetchModels = useCallback(async () => {
    setLoading(true)

    const result = await debouncedSearchRequest({
      input,
      nsfw: showNsfw,
      page: currentPage
    })

    // @ts-ignore
    const { items = [], metadata = {} } = result
    if (result) {
      setSearchResult(items as unknown as Embedding[])
      setTotalItems(metadata.totalItems)
      setTotalPages(metadata.totalPages)
    }
    setLoading(false)
  }, [currentPage, input, showNsfw])

  const fetchModels = useCallback(async () => {
    setLoading(true)
    const result = await searchRequest({
      input,
      page: 1,
      nsfw: showNsfw
    })

    // Happens due to _dev_ environment firing calls twice
    if (result === false) return

    const { items = [], metadata = {} } = result
    setSearchResult(items)
    setTotalItems(metadata.totalItems)
    setTotalPages(metadata.totalPages)

    setLoading(false)
  }, [input, showNsfw])

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCurrentPage(1)
    setInput(event.target.value)
  }

  useEffect(() => {
    fetchModels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    debouncedFetchModels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, input, showNsfw])

  return (
    <>
      <Overlay handleClose={handleClose} disableBackground />
      <DropdownOptions
        className={styles.Dropdown}
        handleClose={handleClose}
        title="Search for Embeddings"
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
        {!loading && totalItems === 0 && (
          <div style={{ fontWeight: 400, marginTop: '8px' }}>
            No matches found. Please try a different search.
          </div>
        )}
        {totalPages >= 1 && totalItems > 0 && (
          <div style={{ fontSize: '12px', fontWeight: 400, marginTop: '4px' }}>
            Page {currentPage} of {totalPages}
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
            {(loading || !Array.isArray(searchResult)) && (
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
            {!loading &&
              Array.isArray(searchResult) &&
              searchResult.map((item) => {
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
        {totalPages > 1 && (
          <ReactPaginate
            className={styles.Pagination}
            breakLabel="..."
            nextLabel=" >"
            forcePage={currentPage - 1}
            onPageChange={(p) => {
              setCurrentPage(p.selected + 1)
            }}
            disableInitialCallback={true}
            pageClassName={styles.PageLi}
            pageRangeDisplayed={3}
            marginPagesDisplayed={1}
            pageCount={totalPages}
            nextClassName={styles.Next}
            previousClassName={styles.Previous}
            previousLabel="< "
            renderOnZeroPageCount={null}
          />
        )}
      </DropdownOptions>
    </>
  )
}

export default EmbeddingSearchModal
