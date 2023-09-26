import { useEffect, useRef, useState } from 'react'

export default function useContentHeight() {
  const contentRef = useRef<any>(null)
  const [height, setHeight] = useState(100)

  useEffect(() => {
    if (contentRef.current) {
      // @ts-ignore
      const contentHeight = contentRef.current.offsetHeight
      setHeight(contentHeight)
    }
  }, [])

  return [contentRef, height]
}
