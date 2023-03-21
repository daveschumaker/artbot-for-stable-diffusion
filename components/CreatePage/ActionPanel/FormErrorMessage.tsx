import React from 'react';
import Errors from 'utils/errors'

// TODO: Allow multiple errors to be displayed at once
interface Props {
  hasValidationError: boolean;
  hasError: string | null;
  errors: {[key: string]: boolean};
}

function FormErrorMessage(props: Props){
  const { hasValidationError, hasError, errors } = props;

  return (
    <>
      {hasValidationError && (
        <div className="mt-2 text-red-500 font-semibold">
          Please correct all input errors before continuing
        </div>
      )}
      {hasError && (
        <div className="mt-2 text-red-500 font-semibold">
          Error: {hasError}
        </div>
      )}
      
      {
        Object.keys(errors||{}).filter(e=>errors[e]).map((key: string) => {
          if (!Errors[key]) return (
            <div className="mt-2 text-red-500 font-semibold">
              Unknown error code: {key}
            </div>
          )

          return (
            <div key={key} className={"mt-2 font-semibold " + Errors[key].className}>
              {Errors[key].text}
            </div>
          )
        })
      }
    </>
  );
}

export default FormErrorMessage;
