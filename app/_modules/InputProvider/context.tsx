'use client'

import PromptInputSettings from 'app/_data-models/PromptInputSettings'
import DefaultPromptInputV2 from 'app/_data-models/v2/DefaultPromptInputV2'
import React, { createContext, useContext, useReducer, useState } from 'react'

type InputContextType = {
  input: DefaultPromptInputV2
  setInput: React.Dispatch<any>
  pageLoaded: boolean
  setPageLoaded: React.Dispatch<React.SetStateAction<boolean>>
}

type InputState = InstanceType<typeof DefaultPromptInputV2>
type InputAction = Partial<InputState>
type InputReducer = React.Reducer<InputState, InputAction>

interface InputProviderProps {
  children: React.ReactNode
}

const defaultInputContext: InputContextType = {
  input: {} as DefaultPromptInputV2,
  setInput: () => {},
  pageLoaded: false,
  setPageLoaded: () => {}
}

const InputContext = createContext<InputContextType>(defaultInputContext)

export const useInput = () => {
  return useContext(InputContext)
}

export const InputProvider: React.FC<InputProviderProps> = ({ children }) => {
  const [pageLoaded, setPageLoaded] = useState(false)

  const inputReducer: InputReducer = (
    state: DefaultPromptInputV2,
    newState: Partial<DefaultPromptInputV2>
  ) => {
    const updatedInputState = { ...state, ...newState }

    if (pageLoaded) {
      PromptInputSettings.saveAllInput(updatedInputState)
    }

    return updatedInputState
  }

  const [input, setInput] = useReducer(inputReducer, new DefaultPromptInputV2())

  return (
    <InputContext.Provider
      value={{ input, setInput, pageLoaded, setPageLoaded }}
    >
      {children}
    </InputContext.Provider>
  )
}
