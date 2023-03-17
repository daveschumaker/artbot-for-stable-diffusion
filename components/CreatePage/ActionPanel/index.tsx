import FormErrorMessage from './FormErrorMessage';
import StylesDropdown from '../StylesDropdown';


// TypeScript refuses to understand absolute paths for some reason, but they are superior to relative paths.
// @ts-ignore
import { Button } from 'components/UI/Button';
// @ts-ignore
import TrashIcon from 'components/icons/TrashIcon';
// @ts-ignore
import SquarePlusIcon from 'components/icons/SquarePlusIcon';
// @ts-ignore
import Linker from 'components/UI//Linker';

const ERROR_INPAINT_MISSING_SOURCE_MASK =
  "Whoa! You need an image and a source mask first before continuing. Please upload an image and add paint an area you'd like to change, or change your model before continuing."

interface Props {
  hasValidationError: boolean;
  hasError: string | null;
  fixedSeedErrorMsg: string;
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
  hasValidationError,
  hasError,
  fixedSeedErrorMsg,
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
  return (
    <>
      <FormErrorMessage
        hasValidationError={hasValidationError}
        hasError={hasError}
        fixedSeedErrorMsg={fixedSeedErrorMsg}
      />

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
              disabled={
                hasValidationError ||
                pending ||
                hasError === ERROR_INPAINT_MISSING_SOURCE_MASK
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