import React, { createContext, useContext, useState } from 'react'
import useModalHeight from './useModalHeight'

interface ContentHeightContextType {
  contentHeight: number
  setContentHeight: React.Dispatch<React.SetStateAction<number>>
  maxModalHeight: number
  setMaxModalHeight: React.Dispatch<React.SetStateAction<number>>
}

const ContentHeightContext = createContext<
  ContentHeightContextType | undefined
>(undefined)

export const useContentHeight = (): ContentHeightContextType => {
  const context = useContext(ContentHeightContext)
  if (!context) {
    throw new Error(
      'useContentHeight must be used within a ContentHeightProvider'
    )
  }
  return context
}

export const ContentHeightProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const [maxModalHeight] = useModalHeight()
  const [contentHeight, setContentHeight] = useState<number>(0)

  const contextValue: ContentHeightContextType = {
    contentHeight,
    setContentHeight,
    // @ts-ignore
    maxModalHeight
  }

  return (
    <ContentHeightContext.Provider value={contextValue}>
      {children}
    </ContentHeightContext.Provider>
  )
}
