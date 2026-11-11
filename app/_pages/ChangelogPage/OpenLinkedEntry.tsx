'use client'

import { useEffect } from 'react'

/**
 * Older years are collapsed. When the URL links to an entry or a year inside
 * one, open its year and scroll to it. Not every browser opens a closed
 * <details> for a fragment link on its own.
 */
export default function OpenLinkedEntry() {
  useEffect(() => {
    const openTarget = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (!id) return

      const target = document.getElementById(id)
      const year = target?.closest('details')
      if (!target || !year) return

      if (!year.open) year.open = true
      target.scrollIntoView()
    }

    openTarget()
    window.addEventListener('hashchange', openTarget)
    return () => window.removeEventListener('hashchange', openTarget)
  }, [])

  return null
}
