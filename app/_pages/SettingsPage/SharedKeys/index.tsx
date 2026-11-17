import { IconCopy, IconPencil, IconTrash } from '@tabler/icons-react'
import DeleteConfirmModal from 'app/_modules/DeleteConfirmModal'
import { Button } from 'app/_components/Button'
import Input from 'app/_components/Input'
import Section from 'app/_components/Section'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import AppSettings from 'app/_data-models/AppSettings'
import React, { useRef, useState } from 'react'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { useStore } from 'statery'
import { userInfoStore } from 'app/_store/userStore'
import { clientHeader } from 'app/_utils/appUtils'
import { basePath } from 'BASE_PATH'
import { showSuccessToast } from 'app/_utils/notificationUtils'
import InteractiveModal from 'app/_components/InteractiveModal/interactiveModal'
import styles from './sharedKeys.module.css'
import { fetchUserDetailsV2 } from 'app/_api/fetchUserDetailsV2'

const SHARED_KEYS_API = 'https://aihorde.net/api/v2/sharedkeys'

const sharedKeyQuery = (key: string) => ({
  queryKey: ['horde', 'sharedkey', key],
  queryFn: async ({ signal }: { signal: AbortSignal }) => {
    const resp = await fetch(`${SHARED_KEYS_API}/${key}`, {
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': clientHeader()
      },
      signal
    })
    if (!resp.ok) throw new Error(`Unable to fetch shared key: ${resp.status}`)
    return resp.json()
  },
  staleTime: 60 * 1000
})

// The Horde can take a while to list a new key in the user's details, or to
// drop a deleted one. Remember this session's changes so the list is right
// in the meantime, including after leaving the page and coming back.
const createdKeyIds = new Set<string>()
const deletedKeyIds = new Set<string>()
// Whose changes those are. Another login starts with empty lists.
let changesOwner: string | undefined

const SharedKeys = () => {
  const queryClient = useQueryClient()
  const [inputKeyName, setInputKeyName] = useState('')
  const [inputKeyKudos, setInputKeyKudos] = useState('0')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inFlight = useRef(false)

  const [showDeleteModal, setShowDeleteModal] = useState<string | boolean>(
    false
  )
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState<string | boolean>(false)
  // Re-renders the list after this session's created and deleted keys change.
  const [, setKeyChanges] = useState(0)

  const userStore = useStore(userInfoStore)
  const {
    loggedIn,
    sharedKey = false,
    sharedkey_ids = [],
    username
  } = userStore

  if (username && username !== changesOwner) {
    createdKeyIds.clear()
    deletedKeyIds.clear()
    changesOwner = username
  }

  const keyIds = Array.from(
    new Set([
      ...(Array.isArray(sharedkey_ids) ? sharedkey_ids : []),
      ...Array.from(createdKeyIds)
    ])
  ).filter((key) => !deletedKeyIds.has(key))

  const detailQueries = useQueries({
    queries: keyIds.map((key) => sharedKeyQuery(key))
  })
  const keyDetails: Record<string, any> = Object.fromEntries(
    keyIds.map((key, i) => [key, detailQueries[i]?.data])
  )

  // Fresh details, so the key list reflects the change just made.
  const refreshUserDetails = () =>
    fetchUserDetailsV2(AppSettings.get('apiKey'), undefined, { fresh: true })

  const handleCopyKeyClick = async (key: string) => {
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error('Clipboard is unavailable')
      await navigator.clipboard.writeText(
        `${window.location.origin}${basePath}?shared_key=${encodeURIComponent(
          key
        )}`
      )
      showSuccessToast({
        message: 'URL for shared API key copied to clipboard!'
      })
    } catch {
      setError(
        'The key was not copied. Your key is still available below; try Copy again or copy it manually.'
      )
    }
  }
  const mutate = async (action: () => Promise<void>) => {
    if (inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setError('')
    try {
      await action()
    } catch (error) {
      setError((error as Error).message)
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }
  const kudosValue = () => {
    const value = Number(inputKeyKudos)
    if (!Number.isFinite(value) || value < 0)
      throw new Error('Enter a valid nonnegative kudos amount.')
    return value
  }
  const send = async (method: string, suffix: string, body?: unknown) => {
    const key = AppSettings.get('apiKey')
    const owner = username
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)
    try {
      const response = await fetch(`${SHARED_KEYS_API}${suffix}`, {
        method,
        headers: {
          apikey: key,
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader()
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: controller.signal
      })
      if (!response.ok)
        throw new Error(
          `Shared key request failed (HTTP ${response.status}). Your entered values were kept.`
        )
      const result = await response.json()
      if (
        userInfoStore.state.username !== owner ||
        AppSettings.get('apiKey') !== key
      )
        throw new Error(
          'The account changed during this request. Refresh the current account before continuing.'
        )
      return result
    } catch (error) {
      if (controller.signal.aborted)
        throw new Error(
          'Shared key request timed out. Refresh the key list to check whether it completed before trying again.'
        )
      throw error
    } finally {
      clearTimeout(timeout)
    }
  }
  const handleCreateKeyClick = () =>
    mutate(async () => {
      if (!inputKeyName.trim()) throw new Error('Enter a shared key name.')
      const details = await send('PUT', '', {
        name: inputKeyName.trim(),
        kudos: kudosValue()
      })
      if (!details.id)
        throw new Error(
          'The server did not return a created key. Your entered values were kept.'
        )
      createdKeyIds.add(details.id)
      queryClient.setQueryData(sharedKeyQuery(details.id).queryKey, details)
      setKeyChanges((n) => n + 1)
      setShowCreateModal(false)
      await handleCopyKeyClick(details.id)
      await refreshUserDetails()
    })
  const handleDeleteKey = (key: string | boolean) =>
    mutate(async () => {
      const details = await send('DELETE', `/${key}`)
      if (details.message !== 'OK')
        throw new Error(
          'The server did not confirm deletion. The key remains listed.'
        )
      deletedKeyIds.add(key as string)
      createdKeyIds.delete(key as string)
      queryClient.removeQueries({
        queryKey: sharedKeyQuery(key as string).queryKey
      })
      setKeyChanges((n) => n + 1)
      setShowDeleteModal(false)
      await refreshUserDetails()
    })
  const handleUpdateKey = (key: string | boolean) =>
    mutate(async () => {
      const details = await send('PATCH', `/${key}`, { kudos: kudosValue() })
      if (!details.id)
        throw new Error(
          'The server did not confirm the update. Your entered values were kept.'
        )
      queryClient.setQueryData(sharedKeyQuery(details.id).queryKey, details)
      setShowEditModal(false)
    })

  if (!loggedIn || sharedKey) {
    return null
  }

  return (
    <>
      {showDeleteModal && (
        <DeleteConfirmModal
          disabled={busy}
          deleteButtonText={busy ? 'Deleting…' : 'Delete'}
          onConfirmClick={() => {
            void handleDeleteKey(showDeleteModal)
          }}
          closeModal={() => {
            if (!inFlight.current) {
              setShowDeleteModal(false)
              setError('')
            }
          }}
        >
          <h3
            className="text-lg font-medium leading-6 text-gray-900"
            id="modal-title"
          >
            Remove shared API key?
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Permanently remove this shared API key?
            </p>
          </div>
          {error && <p role="alert">{error}</p>}
          {busy && <p role="status">Saving shared key changes…</p>}
        </DeleteConfirmModal>
      )}
      {showEditModal && (
        <>
          <InteractiveModal
            disableSwipe
            handleClose={() => {
              if (!inFlight.current) {
                setShowEditModal(false)
                setError('')
              }
            }}
            maxWidth="480px"
          >
            <div className="flex flex-col gap-4 px-2">
              <h2 className="font-bold">Edit shared API key</h2>
              {error && <p role="alert">{error}</p>}
              {busy && <p role="status">Saving shared key changes…</p>}
              <div>
                <label htmlFor="inputKeyKudos">Update kudos:</label>
                <Input
                  id="inputKeyKudos"
                  type="number"
                  value={inputKeyKudos}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setInputKeyKudos(event.target.value)
                  }
                />
              </div>
              <div className="flex flex-row gap-2 w-full justify-end">
                <Button
                  disabled={busy}
                  onClick={() => {
                    setShowEditModal(false)
                    setError('')
                  }}
                  theme="secondary"
                >
                  Cancel
                </Button>
                <Button
                  disabled={busy}
                  onClick={() => {
                    void handleUpdateKey(showEditModal)
                  }}
                >
                  Update
                </Button>
              </div>
            </div>
          </InteractiveModal>
        </>
      )}
      {showCreateModal && (
        <>
          <InteractiveModal
            disableSwipe
            handleClose={() => {
              if (!inFlight.current) {
                setShowCreateModal(false)
                setError('')
              }
            }}
            maxWidth="480px"
          >
            <div className="flex flex-col gap-4 px-2">
              <h2 className="font-bold">Create shared API key</h2>
              {error && <p role="alert">{error}</p>}
              {busy && <p role="status">Saving shared key changes…</p>}
              <div>
                <label htmlFor="inputKeyName">Shared key name:</label>
                <Input
                  id="inputKeyName"
                  type="text"
                  value={inputKeyName}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setInputKeyName(event.target.value)
                  }
                />
              </div>
              <div>
                <label htmlFor="inputKeyKudos">Total kudos:</label>
                <Input
                  id="inputKeyKudos"
                  type="number"
                  value={inputKeyKudos}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setInputKeyKudos(event.target.value)
                  }
                />
              </div>
              <div className="flex flex-row gap-2 w-full justify-end">
                <Button
                  disabled={busy}
                  onClick={() => {
                    setShowCreateModal(false)
                    setError('')
                  }}
                  theme="secondary"
                >
                  Cancel
                </Button>
                <Button
                  disabled={busy}
                  onClick={() => void handleCreateKeyClick()}
                >
                  Create
                </Button>
              </div>
            </div>
          </InteractiveModal>
        </>
      )}
      <Section>
        {error && !showCreateModal && !showEditModal && !showDeleteModal && (
          <p role="alert">{error}</p>
        )}
        <SubSectionTitle>
          Manage shared API keys
          <div className="block w-full mt-2 text-xs">
            Create special API keys that can be shared with your friends or an
            online community. Anyone using a shared key will receive your queue
            priority, potentially allowing for quicker (or more computationally
            expensive) image generations.
          </div>
          <div className="block w-full mt-2 mb-2 text-xs">
            NOTE: Shared key data is cached on the AI Horde backend and it may
            take up to 5 minutes for changes to appear.
          </div>
        </SubSectionTitle>
        {detailQueries.some((query) => query.isPending) && (
          <p role="status">Loading shared key details…</p>
        )}
        {detailQueries.some((query) => query.isError) && (
          <p role="alert">
            Some shared key details could not be loaded.{' '}
            <Button
              onClick={() => {
                void Promise.all(detailQueries.map((query) => query.refetch()))
              }}
            >
              Retry shared keys
            </Button>
          </p>
        )}
        {keyIds.length === 0 && (
          <div className="text-sm mb-2">
            You currently have no shared API keys.
          </div>
        )}
        {keyIds.length > 0 &&
          keyIds.map((key: string) => {
            return (
              <div
                key={key}
                className="font-mono text-xs mb-2 flex flex-row w-full items-center justify-between"
              >
                <div className="flex flex-col">
                  {keyDetails[key]?.name && <div>{keyDetails[key]?.name}</div>}
                  <div>
                    API key: <span className={styles.SharedApiKey}>{key}</span>
                  </div>
                  <div>Kudos: {keyDetails[key]?.kudos ?? 'N/A'}</div>
                </div>
                <div className="flex flex-row gap-2">
                  <Button
                    disabled={busy}
                    title={`Delete shared key ${keyDetails[key]?.name || key}`}
                    onClick={() => {
                      setError('')
                      setShowDeleteModal(key)
                    }}
                    size="small"
                    theme="secondary"
                  >
                    <IconTrash stroke={1.5} />
                  </Button>
                  <Button
                    disabled={busy}
                    title={`Edit shared key ${keyDetails[key]?.name || key}`}
                    onClick={() => {
                      setError('')
                      setInputKeyKudos(String(keyDetails[key]?.kudos ?? 0))
                      setShowEditModal(key)
                    }}
                    size="small"
                  >
                    <IconPencil stroke={1.5} />
                  </Button>
                  <Button
                    title={`Copy shared key ${keyDetails[key]?.name || key}`}
                    onClick={() => void handleCopyKeyClick(key)}
                    size="small"
                  >
                    <IconCopy stroke={1.5} />
                  </Button>
                </div>
              </div>
            )
          })}
        <Button
          disabled={busy}
          onClick={() => {
            setError('')
            setInputKeyKudos('0')
            setShowCreateModal(true)
          }}
        >
          Create key
        </Button>
      </Section>
    </>
  )
}

export default SharedKeys
