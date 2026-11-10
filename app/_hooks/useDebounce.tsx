import React, { useEffect } from 'react'

export const useDebouncedEffect = (
  effect: () => void,
  deps: React.DependencyList | null | undefined,
  delay: number
) => {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay)

    return () => clearTimeout(handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...(deps || []), delay])
}
