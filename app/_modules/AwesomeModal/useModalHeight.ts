import { useWindowSize } from 'app/_hooks/useWindowSize'
import { useCallback, useEffect, useState } from 'react'

export default function useModalHeight() {
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

  return [maxModalHeight]
}
