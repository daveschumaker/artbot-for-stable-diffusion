import { IconInfoTriangle } from '@tabler/icons-react'
import React from 'react'
import Errors from 'app/_utils/errors'

interface Props {
  errors: { [key: string]: boolean }
}

function FormErrorMessage({ errors }: Props) {
  return (
    <>
      {Object.keys(errors || {})
        .filter((e) => errors[e])
        .map((key: string) => {
          if (!Errors[key])
            return (
              <div className="mt-2 text-red-500 font-semibold">
                Unknown error code: {key}
              </div>
            )

          return (
            <div
              key={key}
              className={'mt-2 ' + Errors[key].className}
              style={{
                color: 'rgb(251 191 36)',
                display: 'flex',
                fontWeight: 600,
                gap: '4px'
              }}
            >
              <IconInfoTriangle stroke={1.5} />
              {Errors[key].text}
            </div>
          )
        })}
    </>
  )
}

export default FormErrorMessage
