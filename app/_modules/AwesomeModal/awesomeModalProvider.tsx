import { useWindowSize } from 'app/_hooks/useWindowSize'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'

interface ContentHeightContextType {
  contentHeight: number
  setContentHeight: React.Dispatch<React.SetStateAction<number>>
  maxModalHeight: number | string
}

// @ts-ignore
export const ContentHeight = createContext<ContentHeightContextType>({})

export const useContentHeight = (): ContentHeightContextType => {
  const context = useContext(ContentHeight)
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
  const [contentHeight, setContentHeight] = useState<number>(0)

  const { width } = useWindowSize()
  const [maxModalHeight, setMaxModalHeight] = useState<string | number>('auto')

  const updateModalHeight = useCallback(() => {
    // 64px is subtracted for header/footer
    let offset = 64

    if (width && width < 640) offset = 32
    const maxHeight = window.innerHeight - offset
    setMaxModalHeight(maxHeight)
  }, [width])

  useEffect(() => {
    updateModalHeight()
    window.addEventListener('resize', updateModalHeight)
    return () => {
      window.removeEventListener('resize', updateModalHeight)
    }
  }, [updateModalHeight])

  const contextValue: ContentHeightContextType = {
    contentHeight,
    setContentHeight,
    maxModalHeight
  }

  return (
    <ContentHeight.Provider value={contextValue}>
      {children}
    </ContentHeight.Provider>
  )
}
