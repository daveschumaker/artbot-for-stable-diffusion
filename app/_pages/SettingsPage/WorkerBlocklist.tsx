import { IconPlus, IconTrash } from '@tabler/icons-react'
import { SelectOption } from '_types/artbot'
import { useImageWorkerOptions } from 'app/_api/horde/workers'
import { Button } from 'app/_components/Button'
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
  const [blockedWorkers, setBlockedWorkers] = useState<any[]>([])
  const [selectedWorker, setSelectedWorker] = useState<SelectOption>({
    label: 'None',
    value: null
  })
  const workers = useImageWorkerOptions()

  const handleAddWorker = (workerObj: SelectOption) => {
    const updatedWorkers = [...blockedWorkers]
    const exists = updatedWorkers.filter((obj) => obj.value === workerObj.value)

    if (!exists || exists.length === 0) {
      updatedWorkers.push({
        label: workerObj.label,
        value: workerObj.value,
        timestamp: new Date().toLocaleString()
      })

      AppSettings.save('blockedWorkers', updatedWorkers)
      setBlockedWorkers(updatedWorkers)
    }
  }

  const removeWorkerFromList = (worker: SelectOption) => {
    const updatedWorkers = blockedWorkers.filter(
      (obj) => obj.value !== worker.value
    )

    if (updatedWorkers.length === 0) {
      setUseBlockedWorkers(false)
      AppSettings.set('useBlockedWorkers', false)
    }

    AppSettings.save(
      'blockedWorkers',
      updatedWorkers.length === 0 ? '' : updatedWorkers
    )
    setBlockedWorkers(updatedWorkers)
  }

  useEffect(() => {
    const blockedList = AppSettings.get('blockedWorkers') || []
    setBlockedWorkers(blockedList)

    const forceUse = AppSettings.get('useBlockedWorkers') || false
    setUseBlockedWorkers(forceUse)
  }, [])

  return (
    <Section pb={12}>
      <SubSectionTitle>
        <strong>Worker Blocklist ({blockedWorkers.length}/5)</strong>
        <div className="block w-full mt-2 mb-2 text-xs">
          Add worker IDs here to prevent sending image requests to that machine.
          Useful in instances where a worker is out of date, serving incorrect
          models, or a troll. Adding workers here will increase kudos costs by
          10% due to unoptimal use of Horde resources. Max of 5.
        </div>
      </SubSectionTitle>
      <div className="mb-4">
        <InputSwitchV2
          label="Enable? (block jobs from these workers)"
          tooltip="If enabled, you will block requests to these workers."
          disabled={blockedWorkers.length === 0}
          handleSwitchToggle={() => {
            if (!appStore.useBlockedWorkers) {
              setUseAllowedWorkers(false)
              setUseBlockedWorkers(true)
              AppSettings.set('useAllowedWorkers', false)
              AppSettings.set('useBlockedWorkers', true)
            } else {
              setUseBlockedWorkers(false)
              AppSettings.set('useBlockedWorkers', false)
            }
          }}
          checked={appStore.useBlockedWorkers}
        />
      </div>
      {blockedWorkers.length > 0 &&
        blockedWorkers.map((worker) => {
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
      <MaxWidth max="480px">
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
            value={selectedWorker}
          />
          <Button
            disabled={blockedWorkers.length >= 5 || !selectedWorker.value}
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
