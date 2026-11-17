import { useEffect, useState } from 'react'
import PageTitle from 'app/_components/PageTitle'
import Section from 'app/_components/Section'
import { Button } from 'app/_components/Button'
import { useStore } from 'statery'
import { userInfoStore } from 'app/_store/userStore'
import WorkerInfo from 'app/_modules/WorkerInfo'
import fetchMyWorkers from 'app/_api/fetchMyWorkers'
import { fetchUserDetailsV2 } from 'app/_api/fetchUserDetailsV2'
import { useSettings } from './SettingsContext'
export default function WorkerSettingsPanel() {
  const { values } = useSettings()
  const { workers, worker_ids } = useStore(userInfoStore)
  const ids = JSON.stringify(worker_ids)
  const workerCount = worker_ids?.length || 0
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    let stopped = false
    if (!values.apiKey || !workerCount) {
      setLoading(false)
      return
    }
    setLoading(true)
    void fetchMyWorkers()
      .then((result) => {
        if (!stopped)
          setError(
            result.failed
              ? 'Some workers could not be refreshed. Previously loaded details are kept.'
              : ''
          )
      })
      .catch(() => {
        if (!stopped) setError('Workers could not be loaded.')
      })
      .finally(() => {
        if (!stopped) setLoading(false)
      })
    return () => {
      stopped = true
    }
  }, [ids, values.apiKey, workerCount])
  const retry = async () => {
    setLoading(true)
    setError('')
    try {
      const user = await fetchUserDetailsV2(values.apiKey, 1, { fresh: true })
      const result = await fetchMyWorkers({ fresh: true })
      if (!user || result.failed)
        setError(
          'Workers could not be refreshed. Check your connection and try again.'
        )
    } catch {
      setError(
        'Workers could not be refreshed. Try again when the connection is available.'
      )
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <PageTitle as="h2">Manage Workers</PageTitle>
      {loading && <p role="status">Loading your workers…</p>}
      {error && <p role="alert">{error}</p>}
      {!values.apiKey ? (
        <Section>
          Sign in under Account &amp; AI Horde to manage your workers.
        </Section>
      ) : (
        <>
          {worker_ids === null ? (
            <p className="text-sm">Waiting for your account’s worker list.</p>
          ) : !worker_ids?.length && !loading && !error ? (
            <p className="text-sm">
              You currently have no active workers on AI Horde.
            </p>
          ) : null}
          <Button disabled={loading} onClick={() => void retry()}>
            Refresh workers
          </Button>
          <Section className="flex flex-col gap-2">
            {Object.entries(workers)
              .filter(([id]) => worker_ids?.includes(id))
              .map(([id, worker]) => (
                <WorkerInfo key={id} worker={worker} workers={workers} />
              ))}
          </Section>
        </>
      )}
    </>
  )
}
