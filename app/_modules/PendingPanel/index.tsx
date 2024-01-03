/* eslint-disable @next/next/no-img-element */
'use client'

import {
  IconFilter,
  IconPhoto,
  IconPhotoOff,
  IconSettings,
  IconSortAscending,
  IconSortDescending
} from '@tabler/icons-react'
import styles from './pendingPanel.module.css'
import FlexRow from 'app/_components/FlexRow'
import usePendingJobs from './usePendingJobs'
import { useCallback, useState } from 'react'
import FilterOptions from 'app/_pages/PendingPage/FilterOptions'
import PendingSettings from 'app/_pages/PendingPage/PendingSettings'
import ClearJobs from 'app/_pages/PendingPage/ClearJobs'
import { Button } from 'app/_components/Button'
import { Virtuoso } from 'react-virtuoso'
import PendingPanelImageCard from './PendingPanelImageCard'

export default function PendingPanel() {
  const [filter, setFilter] = useState('all')
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(10)

  const [
    done,
    processing,
    queued,
    waiting,
    error,
    doneCount,
    processingCount,
    queuedCount,
    waitingCount,
    errorCount
  ] = usePendingJobs({
    filter,
    start,
    end
  })

  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
  const [sort, setSort] = useState('old')

  // if (sort === 'old') {
  //   done.sort((a, b) => a.timestamp - b.timestamp)
  // } else if (sort === 'new') {
  //   done.sort((a, b) => b.timestamp - a.timestamp)
  // }

  // @ts-ignore
  const jobs = [...done, ...processing, ...queued, ...waiting, ...error]

  const filterJobs = useCallback(() => {
    let filterJobs = [
      ...done,
      ...processing,
      ...queued,
      ...waiting,
      ...error
    ].filter(() => {
      if (filter === 'all') {
        return true
      }

      if (filter === 'done') {
        return [...done]
      }

      if (filter === 'waiting') {
        return [...waiting]
      }

      if (filter === 'processing') {
        return [...processing, ...queued]
      }

      if (filter === 'error') {
        return [...error]
      }
    })

    return filterJobs
  }, [done, error, filter, processing, queued, waiting])

  let filteredJobs = filterJobs()

  const onRangeChanged = useCallback(
    (range: any) => {
      return
      // Check if close to the start or end and fetch more items
      if (range.endIndex >= filteredJobs.length - 5) {
        setStart(range.startIndex - 10)
        setEnd(range.endIndex + 10)
        console.log(`end??`)
        // fetchMore('end')
      } else if (range.startIndex <= 5) {
        setStart(range.startIndex - 10)
        setEnd(range.endIndex + 10)
        // fetchMore('start')
        console.log(`start??`)
      }
    },
    [filteredJobs.length]
  )

  return (
    <div className={styles.PendingPanelWrapper}>
      <FlexRow gap={4} pb={8}>
        <IconPhoto stroke={1.5} /> Image queue
      </FlexRow>
      <FlexRow
        gap={4}
        style={{
          justifyContent: 'space-between',
          position: 'relative',
          width: '100%'
        }}
      >
        {showFilterDropdown && (
          <FilterOptions
            filter={filter}
            setFilter={setFilter}
            jobs={[
              doneCount,
              processingCount,
              queuedCount,
              waitingCount,
              errorCount
            ]}
            setShowFilterDropdown={setShowFilterDropdown}
          />
        )}
        {showSettingsDropdown && (
          <PendingSettings setShowSettingsDropdown={setShowSettingsDropdown} />
        )}
        <FlexRow>
          <ClearJobs filter={'all'} pendingImages={jobs} size="small" />
        </FlexRow>
        <FlexRow gap={4} style={{ justifyContent: 'flex-end' }}>
          <Button
            onClick={() => setShowFilterDropdown(true)}
            size="square-small"
          >
            <IconFilter stroke={1.5} />
          </Button>
          <Button
            onClick={() => {
              if (sort === 'old') {
                setSort('new')
              } else {
                setSort('old')
              }
            }}
            size="square-small"
          >
            {sort === 'old' && <IconSortDescending stroke={1.5} />}
            {sort === 'new' && <IconSortAscending stroke={1.5} />}
          </Button>
          <Button
            onClick={() => setShowSettingsDropdown(true)}
            size="square-small"
          >
            <IconSettings stroke={1.5} />
          </Button>
        </FlexRow>
      </FlexRow>
      <div className={styles.PendingImagesContainer} style={{}}>
        {filteredJobs.length === 0 && (
          <div className={styles.NoRequests}>
            <IconPhotoOff size={36} stroke={1} />
            You have no pending image requests. Why not create something?
          </div>
        )}

        {filteredJobs.length > 0 && (
          <Virtuoso
            className={styles['virtual-list']}
            totalCount={filteredJobs.length}
            style={{
              overflowY: 'auto',
              position: 'absolute',
              marginTop: '0',
              top: '0',
              bottom: '0',
              left: '0',
              right: '0'
            }}
            components={{
              Footer: () => {
                return (
                  <div
                    style={{
                      height: '8px',
                      marginBottom: '8px'
                    }}
                  >
                    {' '}
                  </div>
                )
              }
            }}
            overscan={5}
            rangeChanged={onRangeChanged}
            itemContent={(index) => {
              return <PendingPanelImageCard imageJob={filteredJobs[index]} />
            }}
          />
        )}
      </div>
    </div>
  )
}
