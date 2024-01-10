import { formatSeconds } from 'app/_utils/helperUtils'
import React, { useCallback, useEffect, useState } from 'react'
import styles from './sortableWorkersTable.module.css'
import { fetchWorkers } from 'app/_api/fetchWorkers'
import {
  IconArrowNarrowDown,
  IconArrowNarrowUp,
  IconCheck,
  IconPoint,
  IconSquareRoundedCheck,
  IconSquareRoundedX
} from '@tabler/icons-react'
import Linker from 'app/_components/Linker'
import { HordeWorkerDetails } from '_types/horde'

interface HordeWorkerKeysForTable {
  kph: number
}
type ExtendedHordeWorkerKeys =
  | keyof HordeWorkerDetails
  | keyof HordeWorkerKeysForTable

export default function SortableTable() {
  // const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState('dsc')
  const [sortBy, setSortBy] = useState<ExtendedHordeWorkerKeys>('kph')
  const [workers, setWorkers] = useState<HordeWorkerDetails[]>([])

  const fetchWorkersFromApi = async () => {
    const data = await fetchWorkers()

    // setLoading(false)
    setWorkers(data)
  }

  useEffect(() => {
    fetchWorkersFromApi()
  }, [])

  console.log(`workers`, workers)

  const badgeColor = (worker: HordeWorkerDetails) => {
    if (worker.maintenance_mode) {
      return 'orange'
    }

    if (worker.online) {
      return 'green'
    }

    if (!worker.online) {
      return 'red'
    }
  }

  const handleHeaderClick = useCallback(
    (key: ExtendedHordeWorkerKeys) => {
      if (sortBy !== key) {
        setSortBy(key)
        setSortOrder('asc')
      } else if (sortOrder === 'asc') {
        setSortOrder('dsc')
      } else {
        setSortOrder('asc')
      }
    },
    [sortBy, sortOrder]
  )

  const showArrow = useCallback(
    (key: string) => {
      if (sortBy === key && sortOrder === 'asc') {
        return <IconArrowNarrowUp stroke={1.5} size={16} />
      } else if (sortBy === key && sortOrder === 'dsc') {
        return <IconArrowNarrowDown stroke={1.5} size={16} />
      } else {
        return null
      }
    },
    [sortBy, sortOrder]
  )

  const sortWorkers = useCallback(() => {
    // @ts-ignore
    return workers.sort((a, b) => {
      let aValue: number
      let bValue: number

      if (sortBy === 'models') {
        aValue = a.models.length
        bValue = b.models.length
      } else if (sortBy === 'kph') {
        aValue = a.uptime ? Math.floor(a.kudos_rewards / (a.uptime / 3600)) : 0
        bValue = b.uptime ? Math.floor(b.kudos_rewards / (b.uptime / 3600)) : 0
      } else {
        // @ts-ignore

        aValue =
          typeof a[sortBy as keyof HordeWorkerDetails] === 'number'
            ? a[sortBy as keyof HordeWorkerDetails]
            : 0
        // @ts-ignore
        bValue =
          typeof b[sortBy as keyof HordeWorkerDetails] === 'number'
            ? b[sortBy as keyof HordeWorkerDetails]
            : 0
      }

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1
      }
    })
  }, [sortBy, sortOrder, workers])

  if (workers.length === 0) return null

  return (
    <>
      <div className="relative h-[600px] bg-body-color">
        <div className={styles.TableWrapper}>
          <table className="table table-sm md:table-xs table-pin-rows w-[1400px] no-scrollbar">
            <thead>
              <tr className="text-black bg-body-color dark:text-white">
                <th></th>
                <th
                  className="cursor-pointer"
                  onClick={() => handleHeaderClick('name')}
                >
                  <div className="flex flex-row">{showArrow('name')}Name</div>
                </th>
                <th
                  className="cursor-pointer"
                  onClick={() => handleHeaderClick('trusted')}
                >
                  <div className="flex flex-row">
                    {showArrow('trusted')}Trusted
                  </div>
                </th>
                <th
                  className="cursor-pointer"
                  onClick={() => handleHeaderClick('models')}
                >
                  <div className="flex flex-row">
                    {showArrow('models')}Models
                  </div>
                </th>
                <th
                  className="cursor-pointer"
                  onClick={() => handleHeaderClick('img2img')}
                >
                  <div className="flex flex-row">
                    {showArrow('img2img')}Img2Img
                  </div>
                </th>
                <th
                  className="cursor-pointer"
                  onClick={() => handleHeaderClick('painting')}
                >
                  <div className="flex flex-row">
                    {showArrow('painting')}Inpainting
                  </div>
                </th>
                <th
                  className="cursor-pointer"
                  onClick={() => handleHeaderClick('lora')}
                >
                  <div className="flex flex-row">{showArrow('lora')}LoRAs</div>
                </th>
                <th
                  className="cursor-pointer"
                  onClick={() => handleHeaderClick('post-processing')}
                >
                  <div className="flex flex-row">
                    {showArrow('post-processing')}Post-Proc
                  </div>
                </th>
                <th
                  className="cursor-pointer"
                  onClick={() => handleHeaderClick('threads')}
                >
                  <div className="flex flex-row">
                    {showArrow('threads')}Threads
                  </div>
                </th>
                <th
                  className="cursor-pointer"
                  onClick={() => handleHeaderClick('max_pixels')}
                >
                  <div className="flex flex-row">
                    {showArrow('max_pixels')}Max Power
                  </div>
                </th>
                <th
                  className="cursor-pointer"
                  onClick={() => handleHeaderClick('max_pixels')}
                >
                  <div className="flex flex-row">Max Dimensions (1:1)</div>
                </th>
                <th
                  className="cursor-pointer"
                  onClick={() => handleHeaderClick('uptime')}
                >
                  <div className="flex flex-row">
                    {showArrow('uptime')}Uptime
                  </div>
                </th>
                <th
                  className="cursor-pointer"
                  onClick={() => handleHeaderClick('kudos_rewards')}
                >
                  <div className="flex flex-row">
                    {showArrow('kudos_rewards')}Kudos
                  </div>
                </th>
                <th
                  className="cursor-pointer"
                  onClick={() => handleHeaderClick('kph')}
                >
                  <div className="flex flex-row">
                    {showArrow('kph')}Kudos / hour
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortWorkers().map((row, i) => {
                if (!row) return null

                const kph = row.uptime
                  ? Math.floor(row.kudos_rewards / (row.uptime / 3600))
                  : false

                return (
                  <tr className="hover:bg-[#dbdbdb] hover:text-black" key={i}>
                    <td>{i + 1}</td>
                    <td>
                      <div className="flex flex-row items-center">
                        <IconPoint
                          stroke="white"
                          fill={badgeColor(row)}
                          size={14}
                        />
                        {row.name}
                      </div>
                    </td>
                    <td
                      style={{
                        color: row.trusted ? 'green' : 'red'
                      }}
                    >
                      {row.trusted ? (
                        <IconSquareRoundedCheck size={18} />
                      ) : (
                        <IconSquareRoundedX size={18} />
                      )}
                    </td>
                    <td>{row.models.length}</td>
                    <td
                      style={{
                        color: row.img2img ? 'green' : 'red'
                      }}
                    >
                      {row.img2img ? <IconCheck size={18} /> : ''}
                    </td>
                    <td
                      style={{
                        color: row.painting ? 'green' : 'red'
                      }}
                    >
                      {row.painting ? <IconCheck size={18} /> : ''}
                    </td>
                    <td
                      style={{
                        color: row.lora ? 'green' : 'red'
                      }}
                    >
                      {row.lora ? <IconCheck size={18} /> : ''}
                    </td>
                    <td
                      style={{
                        color: row['post-processing'] ? 'green' : 'red'
                      }}
                    >
                      {row['post-processing'] ? <IconCheck size={18} /> : ''}
                    </td>
                    <td>{row.threads}</td>
                    <td>{Math.round(row.max_pixels / 32768)}</td>
                    <td>
                      {Math.floor(Math.sqrt(row.max_pixels))} x{' '}
                      {Math.floor(Math.sqrt(row.max_pixels))}
                    </td>
                    <td>{formatSeconds(row.uptime)}</td>
                    <td>{row.kudos_rewards.toLocaleString()}</td>
                    <td>{kph.toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="text-sm mt-4 mb-4">
        Inspired by{' '}
        <Linker href="https://aihorde.sitew3.com/" target="_blank">
          AI Horde worker details page.
        </Linker>
      </div>
    </>
  )
}
