import React from 'react';

// TODO: Allow multiple errors to be displayed at once
interface Props {
  hasValidationError: boolean;
  hasError: string | null;
  fixedSeedErrorMsg: string;
}

function FormErrorMessage(props: Props){
  const { hasValidationError, hasError, fixedSeedErrorMsg } = props;

  return (
    <>
      {hasValidationError && (
        <div className="mt-2 text-red-500 font-semibold">
          Please correct all input errors before continuing
        </div>
      )}
      {hasError && hasError === fixedSeedErrorMsg && (
        <div className="mt-2 text-amber-400 font-semibold">
          {fixedSeedErrorMsg}
        </div>
      )}
      {hasError && hasError !== fixedSeedErrorMsg && (
        <div className="mt-2 text-red-500 font-semibold">
          Error: {hasError}
        </div>
      )}
    </>
  );
}

export default FormErrorMessage;
