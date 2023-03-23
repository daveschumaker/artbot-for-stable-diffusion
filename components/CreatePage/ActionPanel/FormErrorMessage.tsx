import React from 'react';
import Errors from 'utils/errors'

// TODO: Allow multiple errors to be displayed at once
interface Props {
  hasError?: string | null; // TODO: Remove me after control net is refactored
  errors: {[key: string]: boolean};
}

function FormErrorMessage(props: Props){
  const { hasError=null, errors } = props;

  return (
    <>
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
