import { useEffect, useState } from 'react'
import { isAppActive } from 'app/_utils/appUtils'

/**
 * Whether ArtBot should keep refreshing data, by the same rules as
 * isAppActive: focus, visibility, the primary window and the "run in
 * background" setting. Use it to switch a query's refetchInterval on and off.
 */
export function useIsAppActive() {
  const [active, setActive] = useState(isAppActive)

  useEffect(() => {
    const update = () => setActive(isAppActive())
    window.addEventListener('focus', update)
    window.addEventListener('blur', update)
    document.addEventListener('visibilitychange', update)
    // Primary-window changes come from other tabs, with no local event.
    const timer = setInterval(update, 5000)

    return () => {
      window.removeEventListener('focus', update)
      window.removeEventListener('blur', update)
      document.removeEventListener('visibilitychange', update)
      clearInterval(timer)
    }
  }, [])

  return active
}
