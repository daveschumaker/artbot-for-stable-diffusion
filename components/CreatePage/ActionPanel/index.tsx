import FormErrorMessage from './FormErrorMessage';
import StylesDropdown from '../StylesDropdown';

import { Button } from 'components/UI/Button';
import TrashIcon from 'components/icons/TrashIcon';
import SquarePlusIcon from 'components/icons/SquarePlusIcon';
import Linker from 'components/UI//Linker';
import Errors from 'utils/errors';

interface Props {
  errors: { [key: string]: boolean };
  input: string;
  setInput: any;
  resetInput: () => void;
  handleSubmit: () => void;
  pending: boolean;
  totalImagesRequested: number;
  loggedIn: boolean | null;
  totalKudosCost: number;
  kudosPerImage: string;
  showStylesDropdown?: boolean;
}

const ActionPanel = ({
  errors,
  input,
  setInput,
  resetInput,
  handleSubmit,
  pending,
  totalImagesRequested,
  loggedIn,
  totalKudosCost,
  kudosPerImage,
  showStylesDropdown,
}: Props) => {
  function areThereCriticalErrors() {
    return Object.keys(errors || {}).filter((key: string) => (errors[key] && Errors[key]?.blocksCreation)).length > 0
  }

  return (
    <>
      <FormErrorMessage errors={errors} />

      <div className="mt-2 mb-4 w-full flex flex-col md:flex-row gap-2 justify-end items-start">
        {showStylesDropdown && (
          <div className="w-full md:w-1/2 text-sm flex flex-row justify-start gap-2 items-center">
            <StylesDropdown
              input={input}
              setInput={setInput}
              isSearchable={true}
            />
          </div>
        )}

        <div className="w-full md:w-1/2 flex flex-col justify-start gap-2">
          <div className="flex flex-row justify-end gap-2 sm:mt-0">
            <Button
              title="Clear current input"
              btnType="secondary"
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
              disabled={
                pending || areThereCriticalErrors()
              }
              width="100px"
            >
              <span>{pending ? '' : <SquarePlusIcon />}</span>
              {pending ? 'Creating...' : 'Create'}
            </Button>
          </div>
          <div className="flex flex-row justify-end">
            <div className="flex flex-col justify-end">
              <div className="text-xs flex flex-row justify-end gap-2">
                Images to request:{' '}
                <strong>{' ' + totalImagesRequested}</strong>
              </div>
              {loggedIn && (
                <>
                  <div className="text-xs flex flex-row justify-end gap-2">
                    {' '}
                    Generation cost:{' '}
                    <Linker href="/faq#kudos" passHref>
                      <>{totalKudosCost} kudos</>
                    </Linker>
                  </div>
                  <div className="text-xs flex flex-row justify-end gap-2">
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

export default ActionPanel;