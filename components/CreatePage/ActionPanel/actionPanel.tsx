import FormErrorMessage from './FormErrorMessage'

import { Button } from 'components/UI/Button'
import TrashIcon from 'components/icons/TrashIcon'
import SquarePlusIcon from 'components/icons/SquarePlusIcon'
import Linker from 'components/UI/Linker'
import Errors from 'utils/errors'

interface Props {
  errors: { [key: string]: boolean }
  input: string
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
  pending,
  totalImagesRequested,
  loggedIn = false,
  totalKudosCost,
  kudosPerImage
}: Props) => {
  function areThereCriticalErrors() {
    return (
      Object.keys(errors || {}).filter(
        (key: string) => errors[key] && Errors[key]?.blocksCreation
      ).length > 0
    )
  }

  return (
    <>
      <FormErrorMessage errors={errors} />

      <div className="flex flex-col items-start justify-end w-full gap-2 mt-2 mb-4 md:flex-row">
        <div className="flex flex-col justify-start w-full gap-2 md:w-1/2">
          <div className="flex flex-row justify-end gap-2 sm:mt-0">
            <Button
              title="Clear current input"
              theme="secondary"
              onClick={resetInput}
            >
              <span>
                <TrashIcon />
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
              <span>{pending ? '' : <SquarePlusIcon />}</span>
              {pending ? 'Creating...' : 'Create'}
            </Button>
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
