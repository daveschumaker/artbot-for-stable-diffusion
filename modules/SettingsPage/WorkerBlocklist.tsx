import { IconTrash } from '@tabler/icons-react'
import { Button } from 'components/UI/Button'
import Input from 'components/UI/Input'
import InteractiveModal from 'components/UI/InteractiveModal/interactiveModal'
import Section from 'components/UI/Section'
import SubSectionTitle from 'components/UI/SubSectionTitle'
import AppSettings from 'models/AppSettings'
import React, { useEffect, useState } from 'react'

const MAX_BLOCKED_WORKER_COUNT = 5

interface BlockedWorker {
  id: string
  timestamp: string
}

const WorkerBlocklist = () => {
  const [workerId, setWorkerId] = useState('')
  const [showWorkersModal, setShowWorkersModal] = useState(false)
  const [blockedWorkers, setBlockedWorkers] = useState<Array<BlockedWorker>>([])

  const removeWorkerFromList = (workerId: string) => {
    const updatedWorkers = blockedWorkers.filter((obj) => obj.id !== workerId)

    AppSettings.save(
      'blockedWorkers',
      updatedWorkers.length === 0 ? '' : updatedWorkers
    )
    setBlockedWorkers(updatedWorkers)
  }

  const handleAddWorker = (workerId: string) => {
    const updatedWorkers = [...blockedWorkers]
    const exists = updatedWorkers.filter((obj) => obj.id === workerId)

    if (!exists || exists.length === 0) {
      updatedWorkers.push({
        id: workerId,
        timestamp: new Date().toLocaleString()
      })

      AppSettings.save('blockedWorkers', updatedWorkers)
      setBlockedWorkers(updatedWorkers)
    }

    setShowWorkersModal(false)
  }

  useEffect(() => {
    const blockList = AppSettings.get('blockedWorkers') || []
    setBlockedWorkers(blockList)
  }, [])

  return (
    <>
      {showWorkersModal && (
        <>
          <InteractiveModal
            disableSwipe
            handleClose={() => setShowWorkersModal(false)}
            maxWidth="480px"
          >
            <div className="flex flex-col gap-4 px-2">
              <h2 className="font-bold">Add worker to block list</h2>
              <div>
                <label htmlFor="workerInput">Update kudos:</label>
                <Input
                  id="workerInput"
                  type="text"
                  value={workerId}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setWorkerId(event.target.value)
                  }
                />
              </div>
              <div className="flex flex-row gap-2 w-full justify-end">
                <Button
                  onClick={() => setShowWorkersModal(false)}
                  theme="secondary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleAddWorker(workerId)
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </InteractiveModal>
        </>
      )}
      <Section>
        <SubSectionTitle>
          Worker Blocklist
          <div className="block w-full mt-2 text-xs">
            Add worker IDs here to prevent sending image requests to that
            machine. Useful in instances where a worker is out of date, serving
            incorrect models, or a troll. Adding workers here will increase
            kudos costs by 10% due to unoptimal use of Horde resources.{' '}
            <strong>Max of 5.</strong>
          </div>
        </SubSectionTitle>
        {blockedWorkers.length > 0 &&
          blockedWorkers.map((worker) => {
            return (
              <div
                key={worker.id}
                className="font-mono text-xs mb-2 flex flex-row w-full items-center justify-between"
              >
                <div className="flex flex-col">
                  <div>{worker.id}</div>
                  <div>{worker.timestamp}</div>
                </div>
                <div className="flex flex-row gap-2">
                  <Button
                    onClick={() => removeWorkerFromList(worker.id)}
                    size="small"
                    theme="secondary"
                  >
                    <IconTrash stroke={1.5} />
                  </Button>
                </div>
              </div>
            )
          })}
        <Button
          disabled={blockedWorkers.length >= MAX_BLOCKED_WORKER_COUNT}
          onClick={() => {
            if (blockedWorkers.length >= MAX_BLOCKED_WORKER_COUNT) {
              return
            }
            setShowWorkersModal(true)
          }}
        >
          Add worker
        </Button>
      </Section>
    </>
  )
}

export default WorkerBlocklist
