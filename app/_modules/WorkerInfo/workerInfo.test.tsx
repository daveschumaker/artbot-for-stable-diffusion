/**
 * @jest-environment jsdom
 *
 * Pausing a worker from the worker settings panel.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import fetchMyWorkers from 'app/_api/fetchMyWorkers'
import WorkerInfo from './workerInfo'

jest.mock('app/_api/fetchMyWorkers', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined)
}))
jest.mock('app/_api/fetchUserDetailsV2', () => ({
  fetchUserDetailsV2: jest.fn().mockResolvedValue(undefined)
}))
jest.mock('app/_utils/sleep', () => ({
  sleep: jest.fn().mockResolvedValue(undefined)
}))
jest.mock('./ModelsModal', () => ({
  __esModule: true,
  default: () => null
}))

const worker = {
  id: 'w1',
  name: 'My GPU',
  online: true,
  maintenance_mode: false,
  models: [],
  performance: '1.5 megapixelsteps per second',
  requests_fulfilled: 1234,
  kudos_rewards: 10,
  threads: 1,
  max_pixels: 1048576,
  uptime: 3600,
  trusted: true,
  team: { id: 't1' }
}

const renderWorker = (fetchImpl: jest.Mock) => {
  global.fetch = fetchImpl
  const setComponentState = jest.fn()
  const loadingWorkerStatus = {}
  const workers = { [worker.id]: { ...worker } }
  render(
    <WorkerInfo
      loadingWorkerStatus={loadingWorkerStatus}
      setComponentState={setComponentState}
      worker={workers[worker.id]}
      workers={workers}
    />
  )
  return { setComponentState, loadingWorkerStatus, workers }
}

const loadingStates = (setComponentState: jest.Mock) =>
  setComponentState.mock.calls.map(([update]) => update.loadingWorkerStatus)

describe('WorkerInfo pause', () => {
  const originalFetch = global.fetch

  beforeEach(() => jest.clearAllMocks())
  afterEach(() => {
    global.fetch = originalFetch
  })

  it('marks the worker as loading, then clears it', async () => {
    const { setComponentState } = renderWorker(
      jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    )

    fireEvent.click(screen.getByText('Pause worker'))

    await waitFor(() => expect(fetchMyWorkers).toHaveBeenCalled())
    await waitFor(() =>
      expect(loadingStates(setComponentState)).toEqual([
        { w1: true },
        { w1: false }
      ])
    )
  })

  it("leaves the parent's state and the worker props unchanged", async () => {
    const { setComponentState, loadingWorkerStatus, workers } = renderWorker(
      jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    )

    fireEvent.click(screen.getByText('Pause worker'))

    await waitFor(() => expect(setComponentState).toHaveBeenCalledTimes(2))
    expect(loadingWorkerStatus).toEqual({})
    expect(workers.w1.maintenance_mode).toBe(false)
  })

  it('clears the loading state when the request fails', async () => {
    const { setComponentState } = renderWorker(
      jest.fn().mockRejectedValue(new TypeError('offline'))
    )
    fireEvent.click(screen.getByText('Pause worker'))

    await waitFor(() =>
      expect(loadingStates(setComponentState)).toEqual([
        { w1: true },
        { w1: false }
      ])
    )
    // The worker list is reloaded, replacing the optimistic state.
    expect(fetchMyWorkers).toHaveBeenCalled()
  })
})
