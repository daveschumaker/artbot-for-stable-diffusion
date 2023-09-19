import { basePath } from 'BASE_PATH'
import AppSettings from 'app/_data-models/AppSettings'
import { useEffect, useState } from 'react'

const useWorkerDetails = () => {
  const [workers, setWorkers] = useState([])
  const [workerDetails, setWorkerDetails] = useState<object | false>(false)
  const useWorkerId = AppSettings.get('useWorkerId') || ''
  const useBlocklist = AppSettings.get('blockedWorkers')

  const fetchWorkers = async () => {
    const resp = await fetch(`${basePath}/api/worker-details`)
    const data = (await resp.json()) || {}
    const { workers = [] } = data

    const filteredWorkers = workers.filter((worker: any) => {
      return worker.type === 'image'
    })

    setWorkers(filteredWorkers)
  }

  useEffect(() => {
    if (workers.length > 0 && !workerDetails && !useBlocklist && useWorkerId) {
      const filtered = workers.filter((worker: any) => {
        return worker.id === useWorkerId
      })

      if (filtered.length > 0) {
        setWorkerDetails(filtered[0])
      }
    }
  }, [useBlocklist, useWorkerId, workerDetails, workers])

  useEffect(() => {
    fetchWorkers()
  }, [])

  return [workerDetails]
}

export default useWorkerDetails
