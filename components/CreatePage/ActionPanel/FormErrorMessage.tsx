import React from 'react';
import Errors from 'utils/errors'

interface Props {
  errors: {[key: string]: boolean};
}

function FormErrorMessage({errors}: Props){

  return (
    <>
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
