import { useEffect } from 'react'

// @ts-ignore
export const useDebouncedEffect = (effect, deps, delay) => {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay)

    return () => clearTimeout(handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...(deps || []), delay])
}
