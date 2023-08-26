import { useEffect, useState } from 'react'

export default function useElementHeight(elementId: string) {
  const [elementHeight, setElementHeight] = useState(0)

  const updateElementHeight = () => {
    const element = document.getElementById(elementId)
    if (element) {
      const height = element.clientHeight
      setElementHeight(height)
    }
  }

  useEffect(() => {
    updateElementHeight() // Initial height update

    const handleResize = () => {
      updateElementHeight()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementId])

  return elementHeight
}
