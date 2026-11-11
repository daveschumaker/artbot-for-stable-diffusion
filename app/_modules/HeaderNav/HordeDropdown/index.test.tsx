/**
 * @jest-environment jsdom
 *
 * Pausing and resuming a worker from the header menu.
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import fetchMyWorkers from 'app/_api/fetchMyWorkers'
import { userInfoStore } from 'app/_store/userStore'
import HordeDropdown from '.'

jest.mock('app/_api/fetchMyWorkers', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined)
}))
jest.mock('app/_utils/sleep', () => ({
  sleep: jest.fn().mockResolvedValue(undefined)
}))
jest.mock('app/_components/Spinner', () => ({
  __esModule: true,
  default: () => <div data-testid="spinner" />
}))

const worker = {
  id: 'w1',
  name: 'My GPU',
  online: true,
  maintenance_mode: false,
  performance: '1.5 megapixelsteps per second',
  requests_fulfilled: 1234,
  team: { id: 't1' }
}

const icon = (name: string) =>
  document.querySelector(`.tabler-icon-player-${name}`)

const toggle = () =>
  fireEvent.click(icon('pause')?.closest('div') as HTMLElement)

const putRequests = () =>
  (global.fetch as jest.Mock).mock.calls.filter(
    ([, init]) => init?.method === 'PUT'
  )

describe('HordeDropdown worker toggle', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.clearAllMocks()
    act(() => {
      userInfoStore.set({
        worker_ids: [worker.id],
        workers: { [worker.id]: { ...worker } } as any
      })
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('shows a worker as paused once the pause request succeeds', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, status: 200, json: async () => ({}) })
    render(<HordeDropdown />)

    toggle()

    expect(screen.getByTestId('spinner')).toBeTruthy()
    await waitFor(() => expect(icon('play')).toBeTruthy())
    expect(screen.queryByTestId('spinner')).toBeNull()
    expect(JSON.parse(putRequests()[0][1].body)).toEqual({
      maintenance: true,
      name: 'My GPU',
      team: 't1'
    })
    expect(fetchMyWorkers).toHaveBeenCalled()
  })

  it('shows the worker as it was when the Horde rejects the change', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ message: 'Wrong API key' })
    })
    render(<HordeDropdown />)

    toggle()

    await waitFor(() => expect(icon('pause')).toBeTruthy())
    expect(screen.queryByTestId('spinner')).toBeNull()
    expect(fetchMyWorkers).toHaveBeenCalled()
  })

  it('shows the worker as it was when the request fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('offline'))
    render(<HordeDropdown />)

    toggle()

    await waitFor(() => expect(icon('pause')).toBeTruthy())
    expect(screen.queryByTestId('spinner')).toBeNull()
    expect(fetchMyWorkers).toHaveBeenCalled()
  })
})
