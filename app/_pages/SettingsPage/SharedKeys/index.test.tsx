/**
 * @jest-environment jsdom
 *
 * The shared keys panel remembers keys created this session, since the
 * Horde can take a while to list them. Those belong to the user who made
 * them.
 */
import { ReactNode } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { userInfoStore } from 'app/_store/userStore'
import SharedKeys from '.'

jest.mock('app/_api/fetchUserDetailsV2', () => ({
  fetchUserDetailsV2: jest.fn().mockResolvedValue(null)
}))
jest.mock('app/_utils/notificationUtils', () => ({
  showSuccessToast: jest.fn()
}))
jest.mock('app/_components/InteractiveModal/interactiveModal', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>
}))

describe('SharedKeys', () => {
  const originalFetch = global.fetch
  let owner = 0

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) }
    })
    // Creating and then reading the new key both answer with it.
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ id: 'key-from-a', name: 'Friends', kudos: 10 })
    })) as unknown as typeof fetch
    userInfoStore.set({
      loggedIn: true,
      sharedKey: false,
      username: `alice-${++owner}#1`,
      sharedkey_ids: []
    })
  })
  afterEach(() => {
    global.fetch = originalFetch
  })

  it("doesn't show one user's new keys to the next user", async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SharedKeys />
      </QueryClientProvider>
    )

    fireEvent.click(screen.getByText('Create key'))
    fireEvent.change(document.querySelector('#inputKeyName')!, {
      target: { value: 'Friends' }
    })
    await act(async () => {
      fireEvent.click(screen.getByText('Create'))
    })
    expect(await screen.findByText('key-from-a')).toBeTruthy()

    // Alice logs out and Bob logs in, without a reload.
    act(() => {
      userInfoStore.set({ username: 'bob#2', sharedkey_ids: [] })
    })

    expect(screen.queryByText('key-from-a')).toBeNull()
    expect(
      screen.getByText('You currently have no shared API keys.')
    ).toBeTruthy()
  })
  it('keeps a failed create dialog and its entered values available for retry', async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      status: 503,
      json: async () => ({ message: 'Unavailable' })
    })) as unknown as typeof fetch
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SharedKeys />
      </QueryClientProvider>
    )
    fireEvent.click(screen.getByText('Create key'))
    fireEvent.change(document.querySelector('#inputKeyName')!, {
      target: { value: 'Keep this name' }
    })
    await act(async () => {
      fireEvent.click(screen.getByText('Create'))
    })
    expect(screen.getByText('Create shared API key')).toBeTruthy()
    expect(
      (document.querySelector('#inputKeyName') as HTMLInputElement).value
    ).toBe('Keep this name')
    expect(screen.getByRole('alert').textContent).toContain('HTTP 503')
    expect((screen.getByText('Create') as HTMLButtonElement).disabled).toBe(
      false
    )
  })
  it('sends only one mutation while its first request is pending', async () => {
    let finish!: (response: any) => void
    global.fetch = jest.fn(
      () =>
        new Promise((resolve) => {
          finish = resolve
        })
    ) as typeof fetch
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SharedKeys />
      </QueryClientProvider>
    )
    fireEvent.click(screen.getByText('Create key'))
    fireEvent.change(document.querySelector('#inputKeyName')!, {
      target: { value: 'Once' }
    })
    await act(async () => {
      fireEvent.click(screen.getByText('Create'))
      fireEvent.click(screen.getByText('Create'))
    })
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect((screen.getByText('Create') as HTMLButtonElement).disabled).toBe(
      true
    )
    await act(async () => {
      finish({ ok: false, status: 429 })
    })
    expect(screen.getByRole('alert').textContent).toContain('HTTP 429')
  })
  it('keeps a created key available when clipboard permission is denied', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockRejectedValue(new Error('Denied')) }
    })
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SharedKeys />
      </QueryClientProvider>
    )
    fireEvent.click(screen.getByText('Create key'))
    fireEvent.change(document.querySelector('#inputKeyName')!, {
      target: { value: 'Friends' }
    })
    await act(async () => {
      fireEvent.click(screen.getByText('Create'))
    })
    expect(await screen.findByText('key-from-a')).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toContain('not copied')
  })
})
