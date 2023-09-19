/**
 * I've encountered a few instances where NextJS router's pathname field wasn't updating as I would expect.
 * This hook periodically watches for changes in window.location.href and updates path state as needed.
 */

import { useEffect, useState } from 'react'

const usePath = () => {
  const [path, setPath] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    setPath(window.location.href)

    const interval = setInterval(() => {
      if (path !== window.location.href) {
        setPath(window.location.href)
      }
    }, 250)

    return () => clearInterval(interval)
  }, [path])

  return path
}

export default usePath
