import { IconPlus, IconTrash } from '@tabler/icons-react'
import { SelectOption } from '_types/artbot'
import { fetchWorkers } from 'app/_api/fetchWorkers'
import { Button } from 'app/_components/Button'
import Linker from 'app/_components/Linker'
import MaxWidth from 'app/_components/MaxWidth'
import Section from 'app/_components/Section'
import Select from 'app/_components/Select'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import AppSettings from 'app/_data-models/AppSettings'
import InputSwitchV2 from 'app/_modules/AdvancedOptionsPanel/InputSwitchV2'
import {
  appInfoStore,
  setUseAllowedWorkers,
  setUseBlockedWorkers
} from 'app/_store/appStore'
import React, { useEffect, useState } from 'react'
import { useStore } from 'statery'

export default function AllowWorkers() {
  const appStore = useStore(appInfoStore)
  const [allowedWorkers, setAllowedWorkers] = useState<any[]>([])
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

  const handleAddWorker = (workerObj: SelectOption) => {
    const updatedWorkers = [...allowedWorkers]
    const exists = updatedWorkers.filter((obj) => obj.value === workerObj.value)

    if (!exists || exists.length === 0) {
      updatedWorkers.push({
        label: workerObj.label,
        value: workerObj.value,
        timestamp: new Date().toLocaleString()
      })

      AppSettings.save('allowedWorkers', updatedWorkers)
      setAllowedWorkers(updatedWorkers)
    }
  }

  const removeWorkerFromList = (worker: SelectOption) => {
    const updatedWorkers = allowedWorkers.filter(
      (obj) => obj.value !== worker.value
    )

    if (updatedWorkers.length === 0) {
      setUseAllowedWorkers(false)
      AppSettings.set('useAllowedWorkers', false)
    }

    AppSettings.save(
      'allowedWorkers',
      updatedWorkers.length === 0 ? '' : updatedWorkers
    )
    setAllowedWorkers(updatedWorkers)
  }

  useEffect(() => {
    fetchWorkersFromApi()

    const allowedList = AppSettings.get('allowedWorkers') || []
    setAllowedWorkers(allowedList)

    const forceUse = AppSettings.get('useAllowedWorkers') || false
    setUseAllowedWorkers(forceUse)
  }, [])

  return (
    <Section pb={12}>
      <a id="use-specific-workers" />
      <SubSectionTitle>
        <strong>Use Specific Workers ({allowedWorkers.length}/5)</strong>
        <div className="block w-full mt-2 mb-2 text-xs">
          Add workers to send all image requests only to specific workers.
          Useful for debugging purposes or testing features available on
          particular workers. Maximum of 5 workers.{' '}
          <Linker href="/info/workers" passHref>
            View all available workers
          </Linker>
        </div>
      </SubSectionTitle>
      <div className="mb-4">
        <InputSwitchV2
          label="Enable? (only send jobs to these workers)"
          tooltip="If enabled, you will only send requests to these workers."
          disabled={allowedWorkers.length === 0}
          handleSwitchToggle={() => {
            if (!appStore.useAllowedWorkers) {
              setUseAllowedWorkers(true)
              setUseBlockedWorkers(false)
              AppSettings.set('useAllowedWorkers', true)
              AppSettings.set('useBlockedWorkers', false)
            } else {
              setUseAllowedWorkers(false)
              AppSettings.set('useAllowedWorkers', false)
            }
          }}
          checked={appStore.useAllowedWorkers}
        />
      </div>
      {allowedWorkers.length > 0 &&
        allowedWorkers.map((worker) => {
          return (
            <div
              key={worker.id}
              className="font-mono text-sm mb-2 flex flex-row w-full items-center justify-between"
            >
              <div className="flex flex-col">
                <div style={{ fontWeight: 700 }}>{worker.label}</div>
                <div style={{ fontSize: '12px' }}>{worker.value}</div>
                <div style={{ fontSize: '12px' }}>{worker.timestamp}</div>
              </div>
              <div className="flex flex-row gap-2">
                <Button
                  onClick={() => removeWorkerFromList(worker)}
                  size="square"
                  theme="secondary"
                >
                  <IconTrash stroke={1.5} />
                </Button>
              </div>
            </div>
          )
        })}
      <MaxWidth
        // @ts-ignore
        width="480px"
      >
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
              if (obj.value) {
                setSelectedWorker(obj)
              }
            }}
            options={workers}
            // @ts-ignore
            value={selectedWorker}
          />
          <Button
            disabled={allowedWorkers.length >= 5 || !selectedWorker.value}
            onClick={() => {
              if (selectedWorker.value) {
                handleAddWorker(selectedWorker)
                setSelectedWorker({
                  label: 'None',
                  value: null
                })
              }
            }}
            size="square"
          >
            <IconPlus />
          </Button>
        </div>
      </MaxWidth>
    </Section>
  )
}
