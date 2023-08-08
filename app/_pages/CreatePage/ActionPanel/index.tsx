'use client'

import { IconCalculator, IconSquarePlus, IconTrash } from '@tabler/icons-react'

import { Button } from 'components/UI/Button'
import Linker from 'components/UI/Linker'
import Errors from 'utils/errors'
import { useState } from 'react'
import DropdownOptions from 'app/_modules/DropdownOptions'
import DryRunCalculator from '../PromptInput/DryRunCalculator'
import DefaultPromptInput from 'models/DefaultPromptInput'

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
      <div className="flex flex-col items-start justify-end w-full gap-2 mt-2 mb-4 md:flex-row">
        <div className="flex flex-col justify-start w-full gap-2 md:w-1/2">
          <div className="flex flex-row justify-end gap-2 sm:mt-0">
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
                onClick={resetInput}
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
          <div className="flex flex-row justify-end">
            <div className="flex flex-col justify-end">
              <div className="flex flex-row justify-end gap-2 text-xs">
                Images to request: <strong>{' ' + totalImagesRequested}</strong>
              </div>
              {loggedIn && (
                <>
                  <div className="flex flex-row justify-end gap-2 text-xs">
                    {' '}
                    Generation cost:{' '}
                    <Linker href="/faq#kudos" passHref>
                      <>{totalKudosCost} kudos</>
                    </Linker>
                  </div>
                  <div className="flex flex-row justify-end gap-2 text-xs">
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
