/**
 * @jest-environment jsdom
 *
 * The worker details card keeps edits and loaded data through background
 * refreshes, which happen every minute.
 */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { workerQuery } from 'app/_api/horde/workers'
import WorkerDetailsCard from '.'

jest.mock('@ebay/nice-modal-react', () => ({
  __esModule: true,
  default: { show: jest.fn(), remove: jest.fn() }
}))

const worker = (uptime: number) => ({
  id: 'w1',
  name: 'Old name',
  info: 'Old description',
  bridge_agent: 'AI Horde Worker reGen:9.0.0:https://example.test',
  online: true,
  maintenance_mode: false,
  uptime,
  kudos_rewards: 100,
  requests_fulfilled: 10,
  threads: 1,
  max_pixels: 1048576,
  performance: '1.0 megapixelsteps per second',
  models: ['Deliberate'],
  team: { id: null, name: null },
  trusted: true
})

describe('WorkerDetailsCard', () => {
  const originalFetch = global.fetch
  let respond: () => Promise<any>

  const renderCard = () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })
    render(
      <QueryClientProvider client={client}>
        <WorkerDetailsCard edit id="w1" />
      </QueryClientProvider>
    )
    return client
  }

  const refresh = async (client: QueryClient) => {
    await act(async () => {
      await client
        .refetchQueries({ queryKey: workerQuery('w1').queryKey })
        .catch(() => {})
      // React Query tells components about new data on a zero-delay timer.
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
  }

  beforeEach(() => {
    respond = async () => ({
      ok: true,
      status: 200,
      json: async () => worker(60)
    })
    global.fetch = jest.fn((url: string) =>
      url.endsWith('/teams')
        ? Promise.resolve({ ok: true, status: 200, json: async () => [] })
        : respond()
    ) as unknown as typeof fetch
  })
  afterEach(() => {
    global.fetch = originalFetch
  })

  it('keeps a name being typed when the worker refreshes', async () => {
    const client = renderCard()
    await screen.findByText('Rename worker?')
    fireEvent.click(screen.getByText('Rename worker?'))
    const nameBox = screen.getByDisplayValue('Old name')
    fireEvent.change(nameBox, { target: { value: 'New name' } })

    // The refresh brings a new worker object (its uptime changed).
    respond = async () => ({
      ok: true,
      status: 200,
      json: async () => worker(120)
    })
    await refresh(client)

    expect(screen.getByDisplayValue('New name')).toBeTruthy()
  })

  it('keeps showing the worker when a refresh fails', async () => {
    const client = renderCard()
    await screen.findByText('Rename worker?')

    respond = async () => {
      throw new TypeError('Failed to fetch')
    }
    await refresh(client)

    expect(screen.queryByText(/Unable to load this worker/)).toBeNull()
    expect(screen.getByText('Rename worker?')).toBeTruthy()
  })

  it('says so when the worker cannot be loaded at all', async () => {
    respond = async () => {
      throw new TypeError('Failed to fetch')
    }
    renderCard()

    expect(await screen.findByText(/Unable to load this worker/)).toBeTruthy()
  })
})
