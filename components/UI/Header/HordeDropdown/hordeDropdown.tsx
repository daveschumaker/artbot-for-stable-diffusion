import clsx from 'clsx'
import { useState } from 'react'
import { useStore } from 'statery'
import fetchMyWorkers from '../../../../api/fetchMyWorkers'
import AppSettings from '../../../../models/AppSettings'
import { appInfoStore } from '../../../../store/appStore'
import { userInfoStore } from '../../../../store/userStore'
import { clientHeader, getApiHostServer } from '../../../../utils/appUtils'
import { sleep } from '../../../../utils/sleep'
import PauseIcon from '../../../icons/PauseIcon'
import PlayIcon from '../../../icons/PlayIcon'
import PointIcon from '../../../icons/PointIcon'
import SpinnerV2 from '../../../Spinner'
import styles from './hordeDropdown.module.css'

const HordeDropdown = () => {
  const appStore = useStore(appInfoStore)
  const userStore = useStore(userInfoStore)
  const { worker_ids, workers } = userStore

  const initialWorkerState: any = {}

  Object.keys(workers).map((key: string) => {
    if (workers[key].online && !workers[key].maintenance_mode) {
      initialWorkerState[key] = 'active'
    }

    if (workers[key].online && workers[key].maintenance_mode) {
      initialWorkerState[key] = 'paused'
    }

    if (!workers[key].online) {
      initialWorkerState[key] = 'offline'
    }
  })

  const [workerState, setWorkerState] = useState(initialWorkerState)

  const handleWorkerChange = async ({ workerId }: { workerId: string }) => {
    const newWorkerState = Object.assign({}, workerState)
    let tempNewState
    if (workerState[workerId] === 'active') {
      newWorkerState[workerId] = 'loading'
      tempNewState = 'paused'
    }

    if (workerState[workerId] === 'paused') {
      newWorkerState[workerId] = 'loading'
      tempNewState = 'active'
    }

    if (workerState[workerId] === 'offline') {
      newWorkerState[workerId] = 'loading'
      tempNewState = 'active'
    }
    setWorkerState(newWorkerState)

    const workerStatus = await fetch(
      `${getApiHostServer()}/api/v2/workers/${workerId}`,
      {
        body: JSON.stringify({
          maintenance: tempNewState === 'paused' ? true : false,
          name: workers[workerId].name,
          team: workers[workerId].team?.id ?? ''
        }),
        // @ts-ignore
        headers: {
          apikey: AppSettings.get('apiKey'),
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader()
        },
        method: 'PUT'
      }
    )

    await workerStatus.json()
    await sleep(2500)

    newWorkerState[workerId] = tempNewState
    setWorkerState(newWorkerState)

    await fetchMyWorkers()
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

  return (
    <div className="p-[12px] w-full tablet:w-[400px] text-[14px]">
      <div className="font-[700] mb-[8px]">Stable Horde Performance</div>
      <div className="font-mono text-[12px] pl-[8px]">
        <div>
          - <strong>{hordePerformance.queued_requests.toLocaleString()}</strong>{' '}
          pending image requests (
          <strong>
            {Math.floor(
              hordePerformance.queued_megapixelsteps
            ).toLocaleString()}{' '}
            megapixelsteps
          </strong>
          )
        </div>
        <div>
          - <strong>{hordePerformance.worker_count}</strong> workers online,
          running <strong>{hordePerformance.thread_count}</strong> threads
        </div>
        <div className="mt-[8px]">
          -{' '}
          <strong>
            {Math.floor(hordePerformance.queued_forms.toLocaleString())}
          </strong>{' '}
          pending interrogation requests
        </div>
        <div>
          - <strong>{hordePerformance.interrogator_count}</strong> interrogation
          workers online, running{' '}
          <strong>{hordePerformance.interrogator_thread_count}</strong> threads
        </div>
        <div className="mt-[8px]">
          - Currently processing about{' '}
          <strong>{Math.floor(requestsPerMinute)}</strong> image requests per
          minute (
          <strong>
            {Math.floor(
              hordePerformance.past_minute_megapixelsteps
            ).toLocaleString()}{' '}
            megapixelsteps
          </strong>
          ).
        </div>
        <div className="mt-[8px]">
          - At this rate, it will take approximately{' '}
          <strong>{Math.floor(minutesToClear)} minutes</strong> to clear the
          queue.
        </div>
      </div>
      {worker_ids && worker_ids?.length > 0 && (
        <>
          <div className={styles.separator} />
          <div className="font-[700] mb-[8px]">Your workers</div>
          <div className="text-[12px]">
            {Object.keys(workers).map((key) => {
              const worker = workers[key]
              let workerBadgeColor = 'red'

              if (workerState[key] === 'active') {
                workerBadgeColor = 'green'
              }

              if (workerState[key] === 'paused') {
                workerBadgeColor = 'orange'
              }

              if (workerState[key] === 'loading') {
                workerBadgeColor = 'gray'
              }

              return (
                <div key={key}>
                  <div className="mb-[4px] flex flex-row space-between w-full font-mono items-center gap-2 text-[14px]">
                    <div
                      className={clsx(
                        workerState[key] !== 'loading' &&
                          workerState[key] !== 'offline' &&
                          'cursor-pointer'
                      )}
                      onClick={() => {
                        if (
                          workerState[key] === 'loading' ||
                          workerState[key] === 'offline'
                        ) {
                          return
                        }

                        handleWorkerChange({ workerId: key })
                      }}
                    >
                      {workerState[key] === 'loading' && (
                        <SpinnerV2 size={24} />
                      )}
                      {workerState[key] === 'active' && <PauseIcon />}
                      {workerState[key] === 'paused' && <PlayIcon />}
                      {workerState[key] === 'offline' && <PlayIcon />}
                    </div>
                    <div className="flex flex-row gap-[0px] items-center">
                      {worker.name}
                      <PointIcon stroke="white" fill={workerBadgeColor} />
                    </div>
                  </div>
                  <div className="flex flex-col tablet:flex-row tablet:items-center font-mono tablet:justify-between w-full pl-[4px]">
                    <div>{worker.performance.split(' ')[0]} MPS/s</div>
                    <div>
                      {worker.requests_fulfilled.toLocaleString()} requests
                      completed
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default HordeDropdown
