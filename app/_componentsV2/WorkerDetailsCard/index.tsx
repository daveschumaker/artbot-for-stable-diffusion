import NiceModal from '@ebay/nice-modal-react'
import { IconCopy, IconPencil, IconPoint, IconTrash } from '@tabler/icons-react'
import { HordeWorkerDetails } from '_types/horde'
import Linker from 'app/_components/Linker'
import AppSettings from 'app/_data-models/AppSettings'
import { clientHeader, getApiHostServer } from 'app/_utils/appUtils'
import { formatSeconds } from 'app/_utils/helperUtils'
import { showSuccessToast } from 'app/_utils/notificationUtils'
import { useCallback, useEffect, useState } from 'react'

export default function WorkerDetailsCard({
  edit = false,
  // handleClose = () => {},
  id
}: {
  edit?: boolean
  handleClose?: () => void
  id: string
  // worker: HordeWorkerDetails
}) {
  const [notFound, setNotFound] = useState(false)
  const [worker, setWorker] = useState<HordeWorkerDetails>()
  const [workerInfo, setWorkerInfo] = useState('')
  const [editMode, setEditMode] = useState(false)

  const fetchWorkerDetails = async (workerId: string) => {
    const res = await fetch(
      `${getApiHostServer()}/api/v2/workers/${workerId}`,
      {
        cache: 'no-store'
      }
    )
    const details = await res.json()

    if (res.status === 404) {
      setNotFound(true)
    }

    setWorker(details)
    setWorkerInfo(details.info)
  }

  useEffect(() => {
    fetchWorkerDetails(id)
  }, [id])

  const deleteWorker = async () => {
    await fetch(`${getApiHostServer()}/api/v2/workers/${id}`, {
      // @ts-ignore
      headers: {
        apikey: AppSettings.get('apiKey'),
        'Content-Type': 'application/json',
        'Client-Agent': clientHeader()
      },
      method: 'DELETE'
    })
  }

  const updateWorkerDescription = async () => {
    await fetch(`${getApiHostServer()}/api/v2/workers/${id}`, {
      body: JSON.stringify({
        info: workerInfo
      }),
      // @ts-ignore
      headers: {
        apikey: AppSettings.get('apiKey'),
        'Content-Type': 'application/json',
        'Client-Agent': clientHeader()
      },
      method: 'PUT'
    })
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

  const getBadgeColor = useCallback(() => {
    if (!worker) return

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
  }, [worker])

  if (notFound) {
    return <div>No worker found...</div>
  }

  if (!worker) {
    return <div>Loading...</div>
  }

  let workerBadgeColor = getBadgeColor()

  const kph = worker.uptime
    ? Math.floor(worker.kudos_rewards / (worker.uptime / 3600))
    : false

  return (
    <div>
      <div className="flex flex-row gap-2">
        <IconPoint stroke="white" fill={workerBadgeColor} />
        {worker.name}
      </div>
      <div
        className="flex flex-row gap-2 text-xs items-center pl-2 cursor-pointer font-mono"
        onClick={() => {
          navigator?.clipboard?.writeText(`${worker.id}`).then(() => {
            showSuccessToast({ message: 'Worker ID copied!' })
          })
        }}
      >
        <IconCopy stroke={1} size={16} />
        id: {worker.id}
      </div>
      {workerInfo && !edit && (
        <div className="mt-2 text-sm italic">{workerInfo}</div>
      )}
      {edit && !editMode && (
        <div className="mt-2 text-sm italic flex flex-row gap-2">
          <div className="cursor-pointer" onClick={() => setEditMode(true)}>
            <IconPencil stroke={1} size={18} />
          </div>
          {workerInfo || 'No description set'}
        </div>
      )}
      {editMode && (
        <div className="pt-2 flex flex-col gap-2">
          <input
            type="text"
            placeholder="Enter description for your worker"
            className="input input-bordered w-full max-w-xs"
            onChange={(e) => setWorkerInfo(e.target.value)}
            value={workerInfo}
          />
          <div className="flex flex-row gap-2">
            <button
              className="btn btn-secondary btn-sm btn-outline"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={async () => {
                await updateWorkerDescription()
                setEditMode(false)
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}
      <div className="text-sm pt-2">
        Status:{' '}
        <strong>
          {worker.online && worker.maintenance_mode && 'Paused'}
          {worker.online && !worker.maintenance_mode && 'Online'}
          {!worker.online && 'Offline'}
        </strong>
      </div>
      <div className="text-sm">
        Total uptime: <strong>{formatSeconds(worker.uptime)}</strong>
      </div>
      <div className="text-sm pt-2">
        <div>
          Threads: <strong>{worker.threads}</strong>
        </div>
        <div>
          Max resolution (1:1):{' '}
          <strong>
            {Math.floor(Math.sqrt(worker.max_pixels))} x{' '}
            {Math.floor(Math.sqrt(worker.max_pixels))}
          </strong>
        </div>
        <div>
          Max pixels: <strong>{worker.max_pixels?.toLocaleString()}</strong>
        </div>
        <div>
          Performance: <strong>{worker.performance}</strong>
        </div>
        <div>
          Avg time per request:{' '}
          <strong>
            {worker.requests_fulfilled > 0
              ? `${Number(worker.uptime / worker.requests_fulfilled).toFixed(
                  4
                )} seconds`
              : 'N/A'}
          </strong>
        </div>
      </div>
      <div className="text-sm pt-2">
        <div>
          Kudos earned:{' '}
          <strong>{worker?.kudos_rewards?.toLocaleString()}</strong>
        </div>
        <div>
          Kudos rate: <strong>{kph?.toLocaleString()} kudos per hour</strong>
        </div>
        <div>
          Images generated:{' '}
          <strong>{worker.requests_fulfilled?.toLocaleString()}</strong>
        </div>
      </div>
      <div className="text-sm pt-2">
        <table>
          <tbody>
            <tr>
              <td>Inpainting:&nbsp;&nbsp;</td>
              <td>{<strong>{worker?.painting ? '✅' : '❌'}</strong>}</td>
            </tr>
            <tr>
              <td>NSFW:&nbsp;&nbsp;</td>
              <td>{<strong>{worker?.nsfw ? '✅' : '❌'}</strong>}</td>
            </tr>
            <tr>
              <td>Post-processing:&nbsp;&nbsp;</td>
              <td>
                <strong>{worker['post-processing'] ? '✅' : '❌'}</strong>
              </td>
            </tr>
            <tr>
              <td>LORA:&nbsp;&nbsp;</td>
              <td>
                <strong>{worker.lora ? '✅' : '❌'}</strong>
              </td>
            </tr>
            <tr>
              <td>Trusted:&nbsp;&nbsp;</td>
              <td>
                <strong>{worker.trusted ? '✅' : '❌'}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="pt-2 text-sm">
        <details className="collapse collapse-arrow">
          <summary className="collapse-title text-xl font-medium p-0 min-h-0">
            <div className="flex flex-row gap-1 items-center text-left text-sm font-[600] w-full select-none">
              Available models ({worker.models.length})
            </div>
          </summary>
          <div className="collapse-content mt-2 p-0 w-full">
            <ul>
              {sortedModels.map((model: string) => {
                return (
                  <li key={`${model}`}>
                    <Linker href={`/info/models#${model}`} passHref>
                      {model}
                    </Linker>
                  </li>
                )
              })}
            </ul>
          </div>
        </details>
      </div>
      {edit && (
        <div className="pt-4 text-sm">
          <button
            className="btn btn-error btn-sm"
            onClick={() => {
              NiceModal.show('confirmation-modal', {
                buttons: (
                  <div className="flex flex-row justify-end gap-2">
                    <div className="flex flex-row justify-end gap-4">
                      <button
                        className="btn btn-secondary btn-outline"
                        onClick={() => {
                          NiceModal.remove('confirmation-modal')
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="flex flex-row justify-end gap-4">
                      <button
                        className="btn btn-error"
                        onClick={async () => {
                          await deleteWorker()
                          NiceModal.remove('confirmation-modal')
                          NiceModal.remove('workerDetails-modal')
                        }}
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                ),
                content: (
                  <div className="">
                    <div className="flex flex-row gap-2 items-center justify-start">
                      <div className="flex h-8 w-8 justify-center items-center rounded-full bg-red-100">
                        <svg
                          className="h-6 w-6 text-red-600"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 10.5v3.75m-9.303 3.376C1.83 19.126 2.914 21 4.645 21h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 4.88c-.866-1.501-3.032-1.501-3.898 0L2.697 17.626zM12 17.25h.007v.008H12v-.008z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium" id="modal-title">
                        Delete this worker?
                      </h3>
                    </div>
                    <div className="text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <div className="mt-2">
                        <p className="text-sm">
                          Are you sure you want to delete{' '}
                          <strong>{worker.name}</strong>? This action will
                          delete the worker and all statistics associated with
                          it. It will not affect the amount of kudos generated
                          by this worker for your account.
                          <br />
                          <p className="pt-2">
                            <strong>This action cannot be undone.</strong>
                          </p>
                        </p>
                      </div>
                    </div>
                  </div>
                ),
                maxWidth: 'max-w-[480px]',
                title: 'Confirm delete worker'
              })
            }}
          >
            <IconTrash />
            Delete worker?
          </button>
        </div>
      )}
    </div>
  )
}
