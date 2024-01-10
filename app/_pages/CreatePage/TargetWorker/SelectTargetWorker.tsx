import { IconArrowBarLeft } from '@tabler/icons-react'
import { SelectOption } from '_types/artbot'
import { fetchWorkers } from 'app/_api/fetchWorkers'
import { Button } from 'app/_components/Button'
import Select from 'app/_components/Select'
import { setForceSelectedWorker } from 'app/_store/appStore'
import React, { useEffect, useRef, useState } from 'react'

export default function SelectTargetWorker() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [selectedWorker, setSelectedWorker] = useState<SelectOption>({
    label: 'None',
    value: null
  })

  const [workers, setWorkers] = useState<SelectOption[]>([])

  const fetchWorkersFromApi = async () => {
    const data = await fetchWorkers()
    const filteredWorkers = data.map((worker = {}) => {
      return {
        label: worker.name,
        value: worker.id
      }
    })

    // @ts-ignore
    filteredWorkers.sort((a, b) => {
      if (a.label < b.label) {
        return -1
      }
      if (a.label > b.label) {
        return 1
      }
    })

    setWorkers(filteredWorkers)
  }

  useEffect(() => {
    fetchWorkersFromApi()
  }, [])

  useEffect(() => {
    const worker = sessionStorage.getItem('forceSelectedWorker')

    if (worker) {
      setForceSelectedWorker(true)
      setSelectedWorker(JSON.parse(worker))
    }
  }, [])

  return (
    <div ref={containerRef}>
      <div className="text-sm mb-2">
        Temporarily send requests to a <strong>specific worker</strong>. This
        will <strong>override</strong> any current worker preference options
        that you may have set. Clearing this option will restore your previous
        worker preferences.
      </div>
      <div className="text-sm mb-2">
        This setting will affect any images that are queued up and awaiting to
        be sent to the AI Horde.
      </div>
      <div className="text-sm font-bold pb-2">
        Search by worker name or worker ID:
      </div>
      <div className="flex flex-row gap-2 items-center">
        <Select
          formatOptionLabel={(option: SelectOption) => (
            <>
              <div style={{ fontWeight: 700 }}>{option.label}</div>
              <div style={{ fontSize: '12px' }}>{option.value}</div>
            </>
          )}
          onChange={(obj: SelectOption) => {
            setSelectedWorker(obj)

            if (!obj.value || obj.value === null) {
              sessionStorage.setItem('forceSelectedWorker', '')
            } else {
              setForceSelectedWorker(true)
              sessionStorage.setItem('forceSelectedWorker', JSON.stringify(obj))
            }
          }}
          menuPortalTarget={document.querySelector('#worker-target-modal')}
          options={workers}
          // @ts-ignore
          value={selectedWorker}
          styles={{
            menuPortal: (base: React.CSSProperties) => ({
              ...base,
              zIndex: 9999
            })
          }}
        />
        <Button
          theme="secondary"
          onClick={() => {
            setSelectedWorker({
              label: 'None',
              value: null
            })
            sessionStorage.setItem('forceSelectedWorker', '')
            setForceSelectedWorker(false)
          }}
          size="square"
        >
          <IconArrowBarLeft />
        </Button>
      </div>
    </div>
  )
}
