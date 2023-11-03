'use client'

import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'
import PromptInputSettings from 'app/_data-models/PromptInputSettings'
import React, { createContext, useContext, useReducer, useState } from 'react'

type InputContextType = {
  input: DefaultPromptInput
  setInput: React.Dispatch<any>
  pageLoaded: boolean
  setPageLoaded: React.Dispatch<React.SetStateAction<boolean>>
}

type InputState = InstanceType<typeof DefaultPromptInput>
type InputAction = Partial<InputState>
type InputReducer = React.Reducer<InputState, InputAction>

interface InputProviderProps {
  children: React.ReactNode
}

const defaultInputContext: InputContextType = {
  input: {} as DefaultPromptInput,
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
    state: DefaultPromptInput,
    newState: Partial<DefaultPromptInput>
  ) => {
    const updatedInputState = { ...state, ...newState }

    if (pageLoaded) {
      PromptInputSettings.saveAllInput(updatedInputState)
    }

    return updatedInputState
  }

  const [input, setInput] = useReducer(inputReducer, new DefaultPromptInput())

  return (
    <InputContext.Provider
      value={{ input, setInput, pageLoaded, setPageLoaded }}
    >
      {children}
    </InputContext.Provider>
  )
}
