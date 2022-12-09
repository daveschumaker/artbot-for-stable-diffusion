import { useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { fetchUserDetails } from '../../api/userInfo'
import AppSettings from '../../models/AppSettings'
import { setWorker } from '../../store/userStore'
import { getApiHostServer } from '../../utils/appUtils'
import { formatSeconds } from '../../utils/helperUtils'
import { sleep } from '../../utils/sleep'
import ChevronRightIcon from '../icons/ChevronRightIcon'
import CopyIcon from '../icons/CopyIcon'
import PauseIcon from '../icons/PauseIcon'
import PlayIcon from '../icons/PlayIcon'
import PointIcon from '../icons/PointIcon'
import Row from '../Row'
import { Button } from '../UI/Button'
import Linker from '../UI/Linker'
import Panel from '../UI/Panel'

const WorkerTitle = styled.div`
  align-items: center;
  column-gap: 2px;
  display: flex;
  flex-direction: row;
  margin-left: -8px;
`

const WorkerId = styled.div`
  align-items: center;
  column-gap: 4px;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  font-family: monospace;
  font-size: 14px;
`

const WorkerStatus = styled.div`
  font-size: 14px;
  margin-top: 8px;
`

const Spacer = styled.div`
  margin-bottom: 8px;
`

const ExpandModels = styled(Row)`
  cursor: pointer;
`

const ModelList = styled.ul`
  border-left: 1px solid white;
  display: flex;
  flex-direction: column;
  margin-left: 8px;
  padding-top: 8px;
  padding-left: 16px;
  row-gap: 8px;
`

const WorkerInfo = ({
  editable,
  loadingWorkerStatus,
  setComponentState,
  worker,
  workers
}: any) => {
  const [showModels, setShowModels] = useState(false)

  let statusColor = 'green'
  if (worker.online && worker.maintenance_mode) {
    statusColor = 'yellow'
  } else if (!worker.online) {
    statusColor = 'red'
  }

  const handleWorkerChange = async ({ state }: any) => {
    const { id } = worker
    const updateWorkerLoadingState = { ...loadingWorkerStatus }
    loadingWorkerStatus[id] = true

    const optimisticWorkerData = { ...workers }
    optimisticWorkerData[id].maintenance_mode = state === 'pause' ? true : false

    setComponentState({
      loadingWorkerStatus: { ...updateWorkerLoadingState }
    })

    const workerDetails = { ...workers[id] }

    // TODO: Handle and make visible any errors.
    // Optimistically set worker state.
    setWorker({
      ...workerDetails,
      maintenance_mode: state === 'pause' ? true : false
    })

    await fetch(`${getApiHostServer()}/api/v2/workers/${id}`, {
      body: JSON.stringify({
        maintenance: state === 'pause' ? true : false,
        name: worker.name,
        team: worker.team?.id ?? ''
      }),
      // @ts-ignore
      headers: {
        apikey: AppSettings.get('apiKey'),
        'Content-Type': 'application/json'
      },
      method: 'PUT'
    })

    await sleep(1000)

    await fetchUserDetails(AppSettings.get('apiKey'))

    loadingWorkerStatus[id] = false
    setComponentState({ loadingWorkerStatus: { ...updateWorkerLoadingState } })
  }

  const sortedModels =
    worker?.models?.sort((a: string = '', b: string = '') => {
      if (a.toLowerCase() < b.toLowerCase()) {
        return -1
      }
      if (a.toLowerCase() > b.toLowerCase()) {
        return 1
      }
      return 0
    }) ?? []

  return (
    <Panel key={worker.id}>
      <WorkerTitle>
        <PointIcon size={28} fill={statusColor} stroke={statusColor} />
        <strong>{worker.name}</strong>
      </WorkerTitle>
      <WorkerId
        onClick={() => {
          navigator?.clipboard?.writeText(`${worker.id}`).then(() => {
            toast.success('Worker ID copied!', {
              pauseOnFocusLoss: false,
              position: 'top-center',
              autoClose: 2500,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: false,
              progress: undefined,
              theme: 'light'
            })
          })
        }}
      >
        <CopyIcon />
        id: {worker.id}
      </WorkerId>
      <WorkerStatus>
        <div>
          Status: {worker.online && worker.maintenance_mode && 'Paused'}
          {worker.online && !worker.maintenance_mode && 'Online'}
          {!worker.online && 'Offline'}
        </div>
        <div>Total uptime: {formatSeconds(worker.uptime)}</div>
        <Spacer />
        <div>Threads: {worker.threads}</div>
        <div>Max pixels: {worker.max_pixels?.toLocaleString()}</div>
        <div>Performance: {worker.performance}</div>
        <div>
          Avg time per request:{' '}
          {worker.requests_fulfilled > 0
            ? `${Number(worker.uptime / worker.requests_fulfilled).toFixed(
                4
              )} seconds`
            : 'N/A'}
        </div>
        <Spacer />
        <div>Kudos earned: {worker?.kudos_rewards?.toLocaleString()}</div>
        <div>
          Requests completed: {worker.requests_fulfilled?.toLocaleString()}
        </div>
        <Spacer />
        <ExpandModels
          onClick={() => {
            if (showModels) {
              setShowModels(false)
            } else {
              setShowModels(true)
            }
          }}
        >
          <ChevronRightIcon /> Models ({worker?.models?.length ?? 0})
        </ExpandModels>
        {showModels ? (
          <ModelList>
            {sortedModels.map((model: string) => {
              return (
                <li key={`${worker.id}_${model}`}>
                  <Linker href={`/info#${model}`} passHref>
                    - {model}
                  </Linker>
                </li>
              )
            })}
          </ModelList>
        ) : null}
      </WorkerStatus>
      {editable !== false && worker.online && (
        <div className="mt-4">
          {worker.online && !worker.maintenance_mode && (
            <Button
              btnType="secondary"
              disabled={loadingWorkerStatus[worker.id]}
              onClick={() => {
                handleWorkerChange({
                  state: 'pause'
                })
              }}
            >
              {loadingWorkerStatus[worker.id] ? (
                'Updating...'
              ) : (
                <>
                  <PauseIcon /> Pause worker
                </>
              )}
            </Button>
          )}
          {worker.online && worker.maintenance_mode && (
            <Button
              disabled={loadingWorkerStatus[worker.id]}
              onClick={() => {
                handleWorkerChange({
                  state: 'start'
                })
              }}
            >
              {loadingWorkerStatus[worker.id] ? (
                'Updating...'
              ) : (
                <>
                  <PlayIcon /> Re-start worker
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </Panel>
  )
}

export default WorkerInfo
