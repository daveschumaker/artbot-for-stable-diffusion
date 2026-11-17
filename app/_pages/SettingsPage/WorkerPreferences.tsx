import { useEffect, useMemo, useState } from 'react'
import { useImageWorkers } from 'app/_api/horde/workers'
import Select from 'app/_components/Select'
import { Button } from 'app/_components/Button'
import Section from 'app/_components/Section'
import InputSwitchV2 from 'app/_modules/AdvancedOptionsPanel/InputSwitchV2'
import { useSettings } from './SettingsContext'
import type { SelectOption } from '_types/artbot'
import type { WorkerPreference } from 'app/_data-models/settingsSchema'

function WorkerList({
  mode,
  options
}: {
  mode: 'allowed' | 'blocked'
  options: SelectOption[]
}) {
  const { values, saveMany } = useSettings()
  const [selected, setSelected] = useState<SelectOption>({
    label: 'None',
    value: null
  })
  const key = mode === 'allowed' ? 'allowedWorkers' : 'blockedWorkers'
  const enabled = mode === 'allowed' ? 'useAllowedWorkers' : 'useBlockedWorkers'
  const other = mode === 'allowed' ? 'useBlockedWorkers' : 'useAllowedWorkers'
  const list = values[key]
  const label = mode === 'allowed' ? 'Use Specific Workers' : 'Worker Blocklist'
  const commit = (list: WorkerPreference[]) =>
    saveMany({ [key]: list, ...(list.length ? {} : { [enabled]: false }) })
  return (
    <Section>
      <h3
        id={mode === 'allowed' ? 'use-specific-workers' : 'blocked-workers'}
        className="font-bold scroll-mt-24"
      >
        {label} ({list.length}/5)
      </h3>
      <p className="text-sm my-2">
        {mode === 'allowed'
          ? 'Send requests only to these workers. Enabling this turns off the blocklist.'
          : 'Exclude these workers. Enabling this turns off specific-worker selection.'}
      </p>
      <InputSwitchV2
        label={`Enable ${label}`}
        disabled={!list.length}
        checked={values[enabled]}
        handleSwitchToggle={() =>
          saveMany({
            [enabled]: !values[enabled],
            ...(!values[enabled] ? { [other]: false } : {})
          })
        }
      />
      <ul>
        {list.map((worker) => (
          <li
            key={worker.value}
            className="flex items-center justify-between gap-2 text-sm my-3 break-all"
          >
            <span>
              {worker.label}
              <br />
              <small>{worker.value}</small>
            </span>
            <Button
              title={`Remove ${worker.label} from ${label}`}
              onClick={() =>
                commit(list.filter((item) => item.value !== worker.value))
              }
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
      <div className="max-w-[480px]">
        <label
          htmlFor={`${mode}-worker`}
          className="block text-sm font-bold my-2"
        >
          Search by worker name or worker ID:
        </label>
        <div className="flex gap-2 items-center">
          <Select
            inputId={`${mode}-worker`}
            options={options}
            value={selected}
            onChange={(option: SelectOption) => setSelected(option)}
          />
          <Button
            disabled={
              list.length >= 5 ||
              typeof selected.value !== 'string' ||
              list.some((worker) => worker.value === selected.value)
            }
            onClick={() => {
              if (
                typeof selected.value === 'string' &&
                commit([
                  ...list,
                  {
                    label: selected.label,
                    value: selected.value,
                    timestamp: new Date().toLocaleString()
                  }
                ])
              )
                setSelected({ label: 'None', value: null })
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </Section>
  )
}
export default function WorkerPreferences() {
  useEffect(() => {
    if (window.location.hash === '#use-specific-workers')
      document.getElementById('use-specific-workers')?.scrollIntoView()
  }, [])
  const { data, isPending, error, refetch } = useImageWorkers()
  const options = useMemo(
    () =>
      (data || [])
        .map((worker) => ({ label: worker.name, value: worker.id }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [data]
  )
  return (
    <>
      {isPending && <p role="status">Loading available workers…</p>}
      {error && (
        <div role="alert">
          Available workers could not be loaded. Saved selections are kept.{' '}
          <Button onClick={() => void refetch()}>
            Retry available workers
          </Button>
        </div>
      )}
      <WorkerList mode="blocked" options={options} />
      <WorkerList mode="allowed" options={options} />
    </>
  )
}
