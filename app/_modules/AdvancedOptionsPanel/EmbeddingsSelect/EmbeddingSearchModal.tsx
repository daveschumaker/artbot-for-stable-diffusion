/* eslint-disable @next/next/no-img-element */
import DropdownOptions from 'app/_modules/DropdownOptions'
import React, { useCallback, useEffect, useState } from 'react'
import { Embedding } from '_types/civitai'
import FlexCol from 'app/_components/FlexCol'
import Input from 'app/_components/Input'
import { Button } from 'app/_components/Button'
import { IconArrowBarLeft, IconSettings } from '@tabler/icons-react'
import styles from './component.module.css'
import Checkbox from 'app/_components/Checkbox'
import EmbeddingDetailsCard from './EmbeddingDetailsCard'
import AppSettings from 'app/_data-models/AppSettings'
import SpinnerV2 from 'app/_components/Spinner'
import Pagination from 'app/_components/Pagination'
import CacheController from 'app/_data-models/CacheController'

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

const cache = new CacheController()

let pendingRequest = false
// API reference: https://github.com/civitai/civitai/wiki/REST-API-Reference
const searchRequest = async ({
  input,
  page = 1,
  nsfw = false,
  sdxl = false,
  sd15 = false,
  sd21 = false
}: {
  input?: string
  page?: number
  nsfw?: boolean
  sdxl?: boolean
  sd15?: boolean
  sd21?: boolean
}) => {
  try {
    if (pendingRequest) return false
    if (!input?.trim()) return false

    pendingRequest = true

    const controller = new AbortController()
    const signal = controller.signal

    // do sd14 loras/tis work on sd15 models? sd0.9 stuff works with sd1.0 models...
    // what about Turbo and LCM? 2.0 and 2.1? I'm just assuming 2.0 and 2.1 can be mixed, and 1.4 and 1.5 can be mixed, and lcm/turbo/not can be mixed. leave the rest to the user, maybe display that baseline somewhere.
    // I dont think civitai lets you filter by model size, maybe you want to put that filter in the display code (allow 220mb loras only)
    //  - except some workers have modified this. the colab worker has the limit removed, and my runpod is set to 750mb...

    // Per this discussion on GitHub, this is an undocumented feature:
    // https://github.com/orgs/civitai/discussions/733
    // API response gives me the following valid values:
    //  "'SD 1.4' | 'SD 1.5' | 'SD 1.5 LCM' | 'SD 2.0' | 'SD 2.0 768' | 'SD 2.1' | 'SD 2.1 768' | 'SD 2.1 Unclip' | 'SDXL 0.9' | 'SDXL 1.0' | 'SDXL 1.0 LCM' | 'SDXL Distilled' | 'SDXL Turbo' | 'SVD' | 'SVD XT' | 'Playground v2' | 'PixArt a' | 'Other'"
    let baseModelFilter

    baseModelFilter = sdxl
      ? ['0.9', '1.0', '1.0 LCM', 'Turbo']
          .map((e) => '&baseModels=SDXL ' + e)
          .join('')
      : ''
    baseModelFilter += sd15
      ? ['1.4', '1.5', '1.5 LCM'].map((e) => '&baseModels=SD ' + e).join('')
      : ''
    baseModelFilter += sd21
      ? ['2.0', '2.0 768', '2.1', '2.1 768', '2.1 Unclip']
          .map((e) => '&baseModels=SD ' + e)
          .join('')
      : ''
    baseModelFilter = baseModelFilter.replace(/ /g, '%20')

    const query = input ? `&query=${input}` : ''
    const searchKey = `limit=${LIMIT}${query}&page=${page}&nsfw=${nsfw}${baseModelFilter}`

    if (cache.get(searchKey)) {
      const data = cache.get(searchKey)

      const { items = [], metadata = {} } = data
      pendingRequest = false
      return { items, metadata }
    }

    const timeout = setTimeout(() => {
      controller.abort()
      pendingRequest = false
      console.error('Request timed out')
    }, 5000) // Change the timeout duration as needed

    const response = await fetch(
      `https://civitai.com/api/v1/models?types=TextualInversion&sort=Highest Rated&${searchKey}`,
      { signal }
    )
    clearTimeout(timeout)

    const data = await response.json()
    cache.set(searchKey, data)

    const { items = [], metadata = {} } = data
    pendingRequest = false
    return { items, metadata }
  } catch (error) {
    console.error('Error fetching models:', error)
    pendingRequest = false
    return { items: [], metadata: {}, error: true }
  }
}

// @ts-ignore
const debouncedSearchRequest = debounce(searchRequest, 500)

const EmbeddingSearchModal = ({
  handleClose = () => {},
  handleAddEmbedding = (value: any) => value
}) => {
  const [hasError, setHasError] = useState<string | boolean>(false)
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)
  const [showNsfw, setShowNsfw] = useState(AppSettings.get('civitaiShowNsfw'))
  const [showSDXL, setShowSDXL] = useState(AppSettings.get('civitaiShowSDXL'))
  const [showSD15, setShowSD15] = useState(AppSettings.get('civitaiShowSD15'))
  const [showSD21, setShowSD21] = useState(AppSettings.get('civitaiShowSD21'))
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
      sdxl: showSDXL,
      sd15: showSD15,
      sd21: showSD21,
      page: currentPage
    })

    // @ts-ignore
    const { items = [], metadata = {}, error } = result
    if (result && !error) {
      setSearchResult(items as unknown as Embedding[])
      setTotalItems(metadata.totalItems)
      setTotalPages(metadata.totalPages)
    } else if (error) {
      setHasError('Unable to load data from CivitAI, please try again shortly.')
    }
    setLoading(false)
  }, [currentPage, input, showNsfw, showSDXL, showSD15, showSD21])

  const fetchModels = useCallback(async () => {
    setLoading(true)
    const result = await searchRequest({
      input,
      page: 1,
      nsfw: showNsfw,
      sdxl: showSDXL,
      sd15: showSD15,
      sd21: showSD21
    })

    // Happens due to _dev_ environment firing calls twice
    if (result === false) return

    const { items = [], metadata = {} } = result
    setSearchResult(items)
    setTotalItems(metadata.totalItems)
    setTotalPages(metadata.totalPages)

    setLoading(false)
  }, [input, showNsfw, showSDXL, showSD15, showSD21])

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCurrentPage(1)
    setInput(event.target.value)
  }

  const handlePageClick = (page: number) => {
    setCurrentPage(page)
  }

  useEffect(() => {
    fetchModels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    debouncedFetchModels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, input, showNsfw, showSDXL, showSD15, showSD21])

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
            {!input && <div>Enter a search term to begin...</div>}
            {!hasError && (
              <div style={{ fontWeight: 400, marginTop: '8px' }}>
                {hasError}
              </div>
            )}
            {!loading && totalItems === 0 && (
              <div style={{ fontWeight: 400, marginTop: '8px' }}>
                No matches found. Please try a different search.
              </div>
            )}
            {totalPages >= 1 && totalItems > 0 && (
              <div
                style={{ fontSize: '12px', fontWeight: 400, marginTop: '4px' }}
              >
                Page {currentPage} of {totalPages} ({totalItems} results)
              </div>
            )}
            {(loading || (input && !Array.isArray(searchResult))) && (
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
      </FlexCol>
      {totalPages > 1 && (
        <div className={styles.Pagination}>
          <Pagination
            currentPage={currentPage}
            totalCount={totalItems}
            pageSize={LIMIT}
            onPageChange={handlePageClick}
          />
        </div>
      )}
      {/* {totalPages > 1 && (
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
      )} */}
    </>
  )
}

export default EmbeddingSearchModal
