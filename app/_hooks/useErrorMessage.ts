import { useReducer, useState } from 'react'

interface ErrorState {
  [key: string]: any
}

export default function useErrorMessage() {
  const [hasErrors, setHasErrors] = useState(false)
  const [errorMessage, setErrorMessage] = useReducer(
    (state: ErrorState, newState: ErrorState) => {
      const stateToUpdate = {
        ...state,
        ...newState
      }

      // If resetting state from a particular object, delete it.
      for (const property in newState) {
        if (newState[property] === null || newState[property] === '') {
          delete stateToUpdate[property]
        }
      }

      if (Object.keys(stateToUpdate).length === 0) {
        setHasErrors(false)
      } else {
        setHasErrors(true)
      }

      return stateToUpdate
    },
    {}
  )

  return [errorMessage, setErrorMessage, hasErrors] as const
}
