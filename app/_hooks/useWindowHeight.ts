import { useEffect, useState } from 'react'

export default function useWindowHeight() {
  const [windowHeight, setWindowHeight] = useState(window.innerHeight)

  const updateWindowHeight = () => {
    setWindowHeight(window.innerHeight)
  }

  useEffect(() => {
    window.addEventListener('resize', updateWindowHeight)

    return () => {
      window.removeEventListener('resize', updateWindowHeight)
    }
  }, [])

  return windowHeight
}
