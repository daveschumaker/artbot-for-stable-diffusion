/**
 * @jest-environment jsdom
 *
 * Pausing a worker from the worker settings panel.
 */
import { act, fireEvent, render, screen, within } from '@testing-library/react'
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

const makeWorker = (id: string, name: string) => ({
  id,
  name,
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
})

// Each PUT waits until the test answers it, by worker id.
const heldUpdates = () => {
  const pending = new Map<string, (ok: boolean) => void>()
  const fetchMock = jest.fn(
    (url: string) =>
      new Promise((resolve, reject) => {
        const id = url.split('/').pop()!
        pending.set(id, (ok) =>
          ok
            ? resolve({ ok: true, json: async () => ({}) })
            : reject(new TypeError('offline'))
        )
      })
  )
  const answer = async (id: string, ok = true) => {
    await act(async () => {
      pending.get(id)!(ok)
    })
  }
  return { fetchMock, answer }
}

const renderWorkers = (...workers: ReturnType<typeof makeWorker>[]) => {
  const byId = Object.fromEntries(workers.map((w) => [w.id, { ...w }]))
  render(
    <>
      {workers.map((w) => (
        <div data-testid={w.id} key={w.id}>
          <WorkerInfo worker={byId[w.id]} workers={byId} />
        </div>
      ))}
    </>
  )
  return byId
}

const pause = (id: string) =>
  fireEvent.click(within(screen.getByTestId(id)).getByText('Pause worker'))
const isUpdating = (id: string) =>
  within(screen.getByTestId(id)).queryByText('Updating...') !== null

describe('WorkerInfo pause', () => {
  const originalFetch = global.fetch

  beforeEach(() => jest.clearAllMocks())
  afterEach(() => {
    global.fetch = originalFetch
  })

  it('shows "Updating..." until the change and refresh finish', async () => {
    const { fetchMock, answer } = heldUpdates()
    global.fetch = fetchMock as unknown as typeof fetch
    renderWorkers(makeWorker('w1', 'GPU one'))

    pause('w1')
    expect(isUpdating('w1')).toBe(true)

    await answer('w1')
    expect(isUpdating('w1')).toBe(false)
    expect(fetchMyWorkers).toHaveBeenCalledWith({ fresh: true })
  })

  // Both flags used to live in one object copied from stale state, so the
  // second worker could stay on "Updating..." until a reload.
  it('tracks two workers paused at the same time separately', async () => {
    const { fetchMock, answer } = heldUpdates()
    global.fetch = fetchMock as unknown as typeof fetch
    renderWorkers(makeWorker('w1', 'GPU one'), makeWorker('w2', 'GPU two'))

    pause('w1')
    pause('w2')
    expect(isUpdating('w1') && isUpdating('w2')).toBe(true)

    await answer('w1')
    expect(isUpdating('w1')).toBe(false)
    expect(isUpdating('w2')).toBe(true)

    await answer('w2')
    expect(isUpdating('w2')).toBe(false)
  })

  it('clears "Updating..." and refreshes when the request fails', async () => {
    const { fetchMock, answer } = heldUpdates()
    global.fetch = fetchMock as unknown as typeof fetch
    renderWorkers(makeWorker('w1', 'GPU one'))

    pause('w1')
    await answer('w1', false)

    expect(isUpdating('w1')).toBe(false)
    // The refresh replaces the optimistic paused state with the real one.
    expect(fetchMyWorkers).toHaveBeenCalled()
  })

  it('leaves the worker props unchanged', async () => {
    const { fetchMock, answer } = heldUpdates()
    global.fetch = fetchMock as unknown as typeof fetch
    const workers = renderWorkers(makeWorker('w1', 'GPU one'))

    pause('w1')
    await answer('w1')

    expect(workers.w1.maintenance_mode).toBe(false)
  })
})
