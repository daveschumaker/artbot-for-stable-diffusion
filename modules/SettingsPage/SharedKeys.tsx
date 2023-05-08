import { IconCopy, IconPencil, IconTrash } from '@tabler/icons-react'
import { fetchUserDetails } from 'api/userInfo'
import DeleteConfirmModal from 'components/DeleteConfirmModal'
import { Button } from 'components/UI/Button'
import Input from 'components/UI/Input'
import InteractiveModal from 'components/UI/InteractiveModal/interactiveModal'
import Section from 'components/UI/Section'
import SubSectionTitle from 'components/UI/SubSectionTitle'
import AppSettings from 'models/AppSettings'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useStore } from 'statery'
import { userInfoStore } from 'store/userStore'
import { clientHeader } from 'utils/appUtils'

const cacheKeyIds: Array<string> = []
const cacheKeyDetails: any = {}

const SharedKeys = () => {
  const [inputKeyName, setInputKeyName] = useState('')
  const [inputKeyKudos, setInputKeyKudos] = useState('')

  const [showDeleteModal, setShowDeleteModal] = useState<string | boolean>(
    false
  )
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState<string | boolean>(false)

  const [keyIds, setKeyIds] = useState<Array<string>>([])
  const [keyDetails, setKeyDetails] = useState<any>({})

  const userStore = useStore(userInfoStore)
  const { loggedIn, sharedKey = false, sharedkey_ids = [] } = userStore

  // Handle cache issues with AI Horde backend.
  // Populate keyIds if needed.
  useEffect(() => {
    if (sharedkey_ids.length > 0) {
      setKeyIds([...sharedkey_ids])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCopyKeyClick = (key: string) => {
    navigator?.clipboard?.writeText(key).then(() => {
      toast.success('Shared API key copied!', {
        pauseOnFocusLoss: false,
        position: 'top-center',
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: 'light'
      })
    })
  }

  const handleCreateKeyClick = async () => {
    try {
      const data = {
        name: String(inputKeyName),
        kudos: Number(inputKeyKudos)
      }

      const resp = await fetch(`https://aihorde.net/api/v2/sharedkeys`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          apikey: AppSettings.get('apiKey'),
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader()
        }
      })

      const details = await resp.json()

      if (details.id) {
        cacheKeyIds.push(details.id)
        cacheKeyDetails[details.id] = details

        const updateKeyIds = [...keyIds]
        updateKeyIds.push(details.id)
        setKeyIds(updateKeyIds)

        const updateKeyDetails = Object.assign({}, keyDetails)
        updateKeyDetails[details.id] = details
        setKeyDetails(updateKeyDetails)

        handleCopyKeyClick(details.id)
      }

      await fetchUserDetails(AppSettings.get('apiKey'))
      setShowCreateModal(false)
    } catch (err) {
      setShowCreateModal(false)
    }
  }

  const handleDeleteKey = async (key: string | boolean) => {
    try {
      const resp = await fetch(`https://aihorde.net/api/v2/sharedkeys/${key}`, {
        method: 'DELETE',
        headers: {
          apikey: AppSettings.get('apiKey'),
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader()
        }
      })

      const details = await resp.json()

      if (details.message === 'OK') {
        updateAllKeyDetails()

        const updatedKeyIds = keyIds.filter((item) => item !== key)
        setKeyIds(updatedKeyIds)

        const updatedKeyDetails = Object.assign({}, keyDetails)
        delete updatedKeyDetails[key as string]
        setKeyDetails(updatedKeyDetails)
      }
    } catch (err) {
      // ignore me
    }
  }

  const handleUpdateKey = async (key: string | boolean) => {
    const data = {
      name: 'TestFlight1',
      kudos: Number(inputKeyKudos)
    }

    try {
      const resp = await fetch(`https://aihorde.net/api/v2/sharedkeys/${key}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: {
          apikey: AppSettings.get('apiKey'),
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader()
        }
      })

      const details = await resp.json()

      if (details.id) {
        const updateKeyDetails = Object.assign({}, keyDetails)
        updateKeyDetails[details.id] = details
        setKeyDetails(updateKeyDetails)
      }

      setShowEditModal(false)
    } catch (err) {
      console.log(`Error updating shared key:`, err)
      setShowEditModal(false)
    }
  }

  const fetchKeyDetails = async (key: string) => {
    try {
      const resp = await fetch(`https://aihorde.net/api/v2/sharedkeys/${key}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader()
        }
      })

      const details = await resp.json()

      return details
    } catch (err) {
      // ignore me
    }
  }

  const updateState = useCallback(
    (key: string, obj: object) => {
      const updateKeys = Object.assign({}, keyDetails)
      updateKeys[key] = obj

      setKeyDetails(updateKeys)
    },
    [keyDetails]
  )

  const updateAllKeyDetails = useCallback(async () => {
    for (const key of keyIds) {
      const details = await fetchKeyDetails(key)
      updateState(key, details)
    }

    // Ignore updateState, otherwise we trigger an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyIds])

  useEffect(() => {
    if (keyIds.length > 0) {
      updateAllKeyDetails()
    }
  }, [keyIds, updateAllKeyDetails])

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
                  <div>{key}</div>
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
