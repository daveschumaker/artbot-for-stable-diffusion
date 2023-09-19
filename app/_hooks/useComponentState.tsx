import { useReducer } from 'react'

interface ComponentState {
  [key: string]: any
}

export default function useComponentState(initialState: ComponentState) {
  const [componentState, setComponentState] = useReducer(
    (state: ComponentState, newState: ComponentState) => {
      return {
        ...state,
        ...newState
      }
    },
    initialState
  )

  return [componentState, setComponentState] as const
}
