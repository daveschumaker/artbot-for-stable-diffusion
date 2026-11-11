import { IconCopy, IconPencil, IconTrash } from '@tabler/icons-react'
import DeleteConfirmModal from 'app/_modules/DeleteConfirmModal'
import { Button } from 'app/_components/Button'
import Input from 'app/_components/Input'
import Section from 'app/_components/Section'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import AppSettings from 'app/_data-models/AppSettings'
import React, { useState } from 'react'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { useStore } from 'statery'
import { userInfoStore } from 'app/_store/userStore'
import { clientHeader } from 'app/_utils/appUtils'
import { baseHost, basePath } from 'BASE_PATH'
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

const SharedKeys = () => {
  const queryClient = useQueryClient()
  const [inputKeyName, setInputKeyName] = useState('')
  const [inputKeyKudos, setInputKeyKudos] = useState('')

  const [showDeleteModal, setShowDeleteModal] = useState<string | boolean>(
    false
  )
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState<string | boolean>(false)
  // Re-renders the list after this session's created and deleted keys change.
  const [, setKeyChanges] = useState(0)

  const userStore = useStore(userInfoStore)
  const { loggedIn, sharedKey = false, sharedkey_ids = [] } = userStore

  const keyIds = Array.from(
    new Set([...sharedkey_ids, ...Array.from(createdKeyIds)])
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

  const handleCopyKeyClick = (key: string) => {
    const hostname =
      window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : baseHost

    const url = `${hostname}${basePath}?shared_key=${key}`

    navigator?.clipboard?.writeText(url).then(() => {
      showSuccessToast({
        message: 'URL for shared API key copied to clipboard!'
      })
    })
  }

  const handleCreateKeyClick = async () => {
    try {
      const resp = await fetch(SHARED_KEYS_API, {
        method: 'PUT',
        body: JSON.stringify({
          name: String(inputKeyName),
          kudos: Number(inputKeyKudos)
        }),
        headers: {
          apikey: AppSettings.get('apiKey'),
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader()
        }
      })

      const details = await resp.json()

      if (details.id) {
        createdKeyIds.add(details.id)
        queryClient.setQueryData(sharedKeyQuery(details.id).queryKey, details)
        setKeyChanges((n) => n + 1)
        handleCopyKeyClick(details.id)
      }

      await refreshUserDetails()
    } catch (err) {
      console.log(`Error creating shared key:`, err)
    } finally {
      setShowCreateModal(false)
    }
  }

  const handleDeleteKey = async (key: string | boolean) => {
    try {
      const resp = await fetch(`${SHARED_KEYS_API}/${key}`, {
        method: 'DELETE',
        headers: {
          apikey: AppSettings.get('apiKey'),
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader()
        }
      })

      const details = await resp.json()

      if (details.message === 'OK') {
        deletedKeyIds.add(key as string)
        createdKeyIds.delete(key as string)
        queryClient.removeQueries({
          queryKey: sharedKeyQuery(key as string).queryKey
        })
        setKeyChanges((n) => n + 1)
        await refreshUserDetails()
      }
    } catch (err) {
      console.log(`Error deleting shared key:`, err)
    }
  }

  const handleUpdateKey = async (key: string | boolean) => {
    try {
      // Only the kudos limit is editable. The name stays as it is.
      const resp = await fetch(`${SHARED_KEYS_API}/${key}`, {
        method: 'PATCH',
        body: JSON.stringify({ kudos: Number(inputKeyKudos) }),
        headers: {
          apikey: AppSettings.get('apiKey'),
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader()
        }
      })

      const details = await resp.json()

      if (details.id) {
        queryClient.setQueryData(sharedKeyQuery(details.id).queryKey, details)
      }
    } catch (err) {
      console.log(`Error updating shared key:`, err)
    } finally {
      setShowEditModal(false)
    }
  }

  if (!loggedIn || sharedKey) {
    return null
  }

  return (
    <>
      {showDeleteModal && (
        <DeleteConfirmModal
          onConfirmClick={() => {
            handleDeleteKey(showDeleteModal)
            setShowDeleteModal(false)
          }}
          closeModal={() => {
            setShowDeleteModal(false)
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
              Are you sure you want to remove this share API key? It will be
              permanently. This action cannot be undone.
            </p>
          </div>
        </DeleteConfirmModal>
      )}
      {showEditModal && (
        <>
          <InteractiveModal
            disableSwipe
            handleClose={() => setShowEditModal(false)}
            maxWidth="480px"
          >
            <div className="flex flex-col gap-4 px-2">
              <h2 className="font-bold">Edit shared API key</h2>
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
                  onClick={() => setShowEditModal(false)}
                  theme="secondary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleUpdateKey(showEditModal)
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
            handleClose={() => setShowCreateModal(false)}
            maxWidth="480px"
          >
            <div className="flex flex-col gap-4 px-2">
              <h2 className="font-bold">Create shared API key</h2>
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
                  onClick={() => setShowCreateModal(false)}
                  theme="secondary"
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateKeyClick}>Create</Button>
              </div>
            </div>
          </InteractiveModal>
        </>
      )}
      <Section>
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
                    onClick={() => setShowDeleteModal(key)}
                    size="small"
                    theme="secondary"
                  >
                    <IconTrash stroke={1.5} />
                  </Button>
                  <Button onClick={() => setShowEditModal(key)} size="small">
                    <IconPencil stroke={1.5} />
                  </Button>
                  <Button onClick={() => handleCopyKeyClick(key)} size="small">
                    <IconCopy stroke={1.5} />
                  </Button>
                </div>
              </div>
            )
          })}
        <Button onClick={() => setShowCreateModal(true)}>Create key</Button>
      </Section>
    </>
  )
}

export default SharedKeys
