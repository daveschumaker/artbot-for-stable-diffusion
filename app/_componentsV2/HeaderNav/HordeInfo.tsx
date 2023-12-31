'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from 'statery'

import AppSettings from 'app/_data-models/AppSettings'
import { appInfoStore } from 'app/_store/appStore'
import { userInfoStore } from 'app/_store/userStore'
import { clientHeader, getApiHostServer } from 'app/_utils/appUtils'
import { sleep } from 'app/_utils/sleep'
import {
  IconMinusVertical,
  IconPencil,
  IconPlayerPause,
  IconPlayerPlay,
  IconPoint
} from '@tabler/icons-react'
import { HordeWorkerDetails } from '_types/horde'
import NiceModal from '@ebay/nice-modal-react'
import WorkerDetailsCard from '../WorkerDetailsCard'
import { Button } from 'app/_components/Button'
import styles from './headerNav.module.css'

export default function HordeInfo({
  handleClose = () => {}
}: {
  handleClose: () => void
}) {
  const router = useRouter()
  const appStore = useStore(appInfoStore)
  const userStore = useStore(userInfoStore) || {}
  const { worker_ids = [] } = userStore
  const [workersDetails, setWorkersDetails] = useState<HordeWorkerDetails[]>([])

  const getWorkerState = (worker: HordeWorkerDetails) => {
    if (worker.online && !worker.maintenance_mode) {
      return 'active'
    }

    if (worker.online && worker.maintenance_mode) {
      return 'paused'
    }

    if (worker.loading) {
      return 'loading'
    }

    if (!worker.online) {
      return 'offline'
    }
  }

  const fetchWorkerDetails = async (workerId: string) => {
    try {
      const res = await fetch(
        `${getApiHostServer()}/api/v2/workers/${workerId}`,
        {
          cache: 'no-store'
        }
      )
      const workerDetails = await res.json()

      if (res.status === 404) {
        return {
          notFound: true
        }
      }

      return workerDetails
    } catch (err) {
      console.log(`Error: Unable to fetch worker details`)
      console.log(err)
      return {
        notFound: true
      }
    }
  }

  const fetchAllWorkersDetails = useCallback(async () => {
    try {
      if (!worker_ids) return

      // Create an array to hold all the fetch promises
      const fetchPromises = worker_ids.map((id) => fetchWorkerDetails(id))

      // Use Promise.all to wait for all fetches to complete
      let results = await Promise.all(fetchPromises)
      results = results.filter((result) => !result.notFound)

      // Sort the results first by online status and then by requests_fulfilled
      results = results.sort((a, b) => {
        // Sort by online status first (true values first)
        if (a.online && !b.online) {
          return -1
        }
        if (!a.online && b.online) {
          return 1
        }
        // If online status is the same, then sort by requests_fulfilled (higher values first)
        return b.requests_fulfilled - a.requests_fulfilled
      })

      // Update the state with all the worker details
      setWorkersDetails(results)
    } catch (error) {
      console.error('Failed to fetch worker details:', error)
    }
  }, [worker_ids])

  const handleWorkerChange = async ({ workerId }: { workerId: string }) => {
    const worker = workersDetails.find((worker) => worker.id === workerId)

    if (!worker) {
      return
    }

    const workerState = getWorkerState(worker)

    if (workerState === 'loading') {
      return
    }

    // Set the loading state for the specific worker
    setWorkersDetails((prevDetails) =>
      prevDetails.map((worker: HordeWorkerDetails) =>
        worker.id === workerId ? { ...worker, loading: true } : worker
      )
    )

    let tempNewState
    if (workerState === 'active') {
      tempNewState = 'paused'
    }

    if (workerState === 'paused') {
      tempNewState = 'active'
    }

    if (workerState === 'offline') {
      tempNewState = 'active'
    }

    await fetch(`${getApiHostServer()}/api/v2/workers/${workerId}`, {
      body: JSON.stringify({
        maintenance: tempNewState === 'paused' ? true : false,
        name: worker.name,
        team: worker.team?.id ?? ''
      }),
      // @ts-ignore
      headers: {
        apikey: AppSettings.get('apiKey'),
        'Content-Type': 'application/json',
        'Client-Agent': clientHeader()
      },
      method: 'PUT'
    })

    await sleep(10000)
    await fetchAllWorkersDetails()
  }

  const {
    hordePerformance = {
      queued_requests: 0,
      queued_megapixelsteps: 0
    }
  }: { hordePerformance: any } = appStore
  let stepsPerRequest: number = 0
  let requestsPerMinute: number = 0
  let minutesToClear: number = 0

  if (hordePerformance.queued_requests) {
    stepsPerRequest =
      hordePerformance.queued_megapixelsteps / hordePerformance.queued_requests
    requestsPerMinute =
      hordePerformance.past_minute_megapixelsteps / stepsPerRequest
    minutesToClear =
      hordePerformance.queued_megapixelsteps /
      hordePerformance.past_minute_megapixelsteps
  }

  const getBadgeColor = useCallback(
    (id: string) => {
      const worker = workersDetails.filter((worker) => worker.id === id)[0]
      const workerState = getWorkerState(worker)
      let workerBadgeColor = 'red'

      if (workerState === 'active') {
        workerBadgeColor = 'green'
      }

      if (workerState === 'paused') {
        workerBadgeColor = 'orange'
      }

      if (workerState === 'loading') {
        workerBadgeColor = 'gray'
      }

      return workerBadgeColor
    },
    [workersDetails]
  )

  const WorkerDetails = ({ worker }: { worker: HordeWorkerDetails }) => {
    const { id } = worker
    const workerState = getWorkerState(worker)
    let workerBadgeColor = getBadgeColor(id)

    const kph = worker.uptime
      ? Math.floor(worker.kudos_rewards / (worker.uptime / 3600))
      : false

    return (
      <div
        className={styles.WorkerDetails}
        // className="font-mono p-2 rounded-lg text-white bg-[#b3b3b3]"
      >
        <div className="flex flex-row gap-2 items-center mb-2">
          <div className="flex flex-row gap-2">
            <Button
              disabled={workerState === 'offline' || workerState === 'loading'}
              onClick={() => {
                if (worker.loading || workerState === 'offline') {
                  return
                }

                handleWorkerChange({ workerId: id })
              }}
              size="square-small"
            >
              {worker.loading && (
                <span className="loading loading-spinner loading-sm"></span>
              )}
              {!worker.loading && workerState === 'active' && (
                <IconPlayerPause />
              )}
              {!worker.loading && workerState === 'paused' && (
                <IconPlayerPlay />
              )}
              {!worker.loading && workerState === 'offline' && (
                <IconPlayerPlay />
              )}
            </Button>
            <Button
              // className="btn btn-sm btn-square btn-primary cursor-pointer"
              size="square-small"
              onClick={() => {
                NiceModal.show('workerDetails-modal', {
                  buttons: (
                    <div className="flex flex-row justify-end gap-4">
                      <button
                        className="btn"
                        onClick={() => {
                          NiceModal.remove('workerDetails-modal')
                          fetchAllWorkersDetails()
                        }}
                      >
                        OK
                      </button>
                    </div>
                  ),
                  content: <WorkerDetailsCard edit id={worker.id} />,
                  handleClose: fetchAllWorkersDetails,
                  maxWidth: 'max-w-[480px]',
                  title: 'Worker Details'
                })
              }}
            >
              <IconPencil stroke={1.5} />
            </Button>
          </div>
          <div className="flex flex-row gap-0" title={workerState}>
            <IconPoint stroke="white" fill={workerBadgeColor} />
            {worker.name}
          </div>
        </div>
        <div className="flex flex-row gap-2 text-xs sm:text-sm">
          <div>{worker.requests_fulfilled.toLocaleString()} images</div>
          <div className="text-primary">
            <IconMinusVertical />
          </div>
          {kph && (
            <>
              <div>{kph.toLocaleString()} kudos/hr</div>
              <div className="text-primary">
                <IconMinusVertical />
              </div>
            </>
          )}
          <div>{worker.performance.split(' ')[0]} MPS/s</div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    // Call the function to fetch worker details
    fetchAllWorkersDetails()
  }, [fetchAllWorkersDetails, worker_ids])

  return (
    <div>
      <ul className="font-mono list-disc text-[14px] mb-2">
        <li>
          <strong>
            {!isNaN(hordePerformance.queued_requests)
              ? hordePerformance.queued_requests.toLocaleString()
              : ''}
          </strong>{' '}
          pending image requests
          <br /> (
          <strong>
            {!isNaN(hordePerformance.queued_megapixelsteps)
              ? Math.floor(
                  hordePerformance.queued_megapixelsteps
                ).toLocaleString()
              : ''}{' '}
            megapixelsteps
          </strong>
          )
        </li>
        <li>
          <strong>{hordePerformance.worker_count}</strong> image workers online
          <br />(<strong>{hordePerformance.thread_count}</strong> threads)
        </li>
        <li>
          <strong>
            {!isNaN(hordePerformance.queued_forms)
              ? Math.floor(hordePerformance.queued_forms.toLocaleString())
              : ''}
          </strong>{' '}
          pending interrogation requests
        </li>
        <li>
          <strong>{hordePerformance.interrogator_count}</strong> interrogation
          workers online
          <br />(<strong>
            {hordePerformance.interrogator_thread_count}
          </strong>{' '}
          threads)
        </li>
        <li>
          Currently processing about{' '}
          <strong>
            {requestsPerMinute ? Math.floor(requestsPerMinute) : ''}
          </strong>{' '}
          image requests per minute (
          <strong>
            {!isNaN(hordePerformance.past_minute_megapixelsteps)
              ? Math.floor(
                  hordePerformance.past_minute_megapixelsteps
                ).toLocaleString()
              : ''}{' '}
            megapixelsteps
          </strong>
          ).
        </li>
        <li>
          It&apos;ll take approximately{' '}
          <strong>
            {!isNaN(minutesToClear) ? Math.floor(minutesToClear) : ''} minutes
          </strong>{' '}
          to clear the queue.
        </li>
      </ul>
      <div className="divider before:bg-input-color after:bg-input-color">
        Your Workers
      </div>
      {(!workersDetails ||
        (workersDetails?.length === 0 && worker_ids?.length === 0)) && (
        <div>You have no active GPU workers.</div>
      )}
      {workersDetails?.length === 0 && worker_ids && worker_ids?.length > 0 && (
        <div className="my-2">
          <span className="loading loading-spinner loading-sm"></span>
          Loading worker details...
        </div>
      )}
      {worker_ids && worker_ids?.length > 0 && (
        <div className="flex flex-col gap-2">
          {workersDetails.map((worker) => {
            return <WorkerDetails key={worker.id} worker={worker} />
          })}
          <div className="text-xs italic">
            Due to server caching, data may be a few minutes out of date.
          </div>
          <Button
            className="btn btn-primary"
            onClick={() => {
              router.push('/settings?panel=workers')
              handleClose()
            }}
          >
            Manage workers
          </Button>
        </div>
      )}
    </div>
  )
}
