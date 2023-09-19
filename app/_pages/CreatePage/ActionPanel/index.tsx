'use client'

import { IconCalculator, IconSquarePlus, IconTrash } from '@tabler/icons-react'

import { Button } from 'app/_components/Button'
import Linker from 'app/_components/Linker'
import Errors from 'app/_utils/errors'
import { useState } from 'react'
import DropdownOptions from 'app/_modules/DropdownOptions'
import DryRunCalculator from '../PromptInput/DryRunCalculator'
import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'
import DeleteConfirmModal from 'app/_modules/DeleteConfirmModal'
import useLockedBody from 'app/_hooks/useLockedBody'

interface Props {
  errors: { [key: string]: boolean }
  input: DefaultPromptInput
  disableSubmit?: boolean
  setInput: any
  resetInput: () => void
  handleSubmit: () => void
  pending: boolean
  totalImagesRequested: number
  loggedIn: boolean | null
  totalKudosCost: number
  kudosPerImage: string
  showStylesDropdown?: boolean
}

const ActionPanel = ({
  disableSubmit = false,
  errors,
  resetInput,
  handleSubmit,
  input,
  pending,
  totalImagesRequested,
  loggedIn = false,
  totalKudosCost,
  kudosPerImage
}: Props) => {
  const [, setLocked] = useLockedBody(false)
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false)
  const [showDryRun, setShowDryRun] = useState(false)

  function areThereCriticalErrors() {
    return (
      Object.keys(errors || {}).filter(
        (key: string) => errors[key] && Errors[key]?.blocksCreation
      ).length > 0
    )
  }

  return (
    <>
      {showResetConfirmModal && (
        <DeleteConfirmModal
          deleteButtonText="Reset"
          onConfirmClick={() => {
            setLocked(false)
            resetInput()
            setShowResetConfirmModal(false)
          }}
          closeModal={() => {
            setLocked(false)
            setShowResetConfirmModal(false)
          }}
        >
          <h3
            className="text-lg font-medium leading-6 text-gray-900"
            id="modal-title"
          >
            Reset all settings?
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Are you sure you want to reset all image generation parameters to
              default settings?
            </p>
          </div>
        </DeleteConfirmModal>
      )}

      <div
        className="CreateImageActionPanel w-full gap-2 mt-2 mb-4 md:flex-row"
        style={{
          marginBottom: '8px'
        }}
      >
        <div className="flex flex-col justify-start w-full gap-2 md:w-1/2">
          <div
            className="flex flex-row gap-2 sm:mt-0"
            style={{
              justifyContent: 'flex-end'
            }}
          >
            <div
              style={{
                columnGap: '4px',
                display: 'flex',
                position: 'relative'
              }}
            >
              <Button
                title="Clear current input"
                theme="secondary"
                onClick={() => {
                  setShowResetConfirmModal(true)
                }}
              >
                <span>
                  <IconTrash stroke={1.5} />
                </span>
                <span>Reset all?</span>
              </Button>
              <Button
                title="Create new image"
                onClick={handleSubmit}
                // @ts-ignore
                disabled={disableSubmit || pending || areThereCriticalErrors()}
                width="100px"
              >
                <span>{pending ? '' : <IconSquarePlus stroke={1.5} />}</span>
                {pending ? 'Creating...' : 'Create'}
              </Button>
              {loggedIn && (
                <Button
                  disabled={!input.prompt}
                  onClick={() => setShowDryRun(true)}
                >
                  <IconCalculator stroke={1.5} />
                </Button>
              )}

              {showDryRun && (
                <DropdownOptions
                  handleClose={() => setShowDryRun(false)}
                  title="Dry-run (kudos estimate)"
                  top="46px"
                >
                  <DryRunCalculator
                    input={input}
                    totalImagesRequested={totalImagesRequested}
                  />
                </DropdownOptions>
              )}
            </div>
          </div>
          <div
            className="flex flex-row"
            style={{
              fontSize: '12px',
              justifyContent: 'flex-end'
            }}
          >
            <div className="flex flex-col justify-end">
              <div
                className="flex flex-row gap-2 text-xs"
                style={{
                  justifyContent: 'flex-end'
                }}
              >
                Images to request: <strong>{' ' + totalImagesRequested}</strong>
              </div>
              {loggedIn && (
                <>
                  <div
                    className="flex flex-row gap-2 text-xs"
                    style={{
                      justifyContent: 'flex-end'
                    }}
                  >
                    {' '}
                    Generation cost:{' '}
                    <Linker href="/faq#kudos" passHref>
                      <>{totalKudosCost} kudos</>
                    </Linker>
                  </div>
                  <div
                    className="flex flex-rowgap-2 text-xs"
                    style={{
                      justifyContent: 'flex-end'
                    }}
                  >
                    Per image:{' '}
                    <Linker href="/faq#kudos" passHref>
                      <>{kudosPerImage} kudos</>
                    </Linker>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ActionPanel
