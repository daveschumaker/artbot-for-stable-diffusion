'use client'

/**
 * Dynamic view to toggle whether or not the pending panel
 * should be displayed on create page based on width
 * of browser window.
 */

import { useWindowSize } from 'app/_hooks/useWindowSize'
import PendingPanel from '.'

export default function PendingPanelView() {
  const { width } = useWindowSize()

  if (!width || width < 1100) {
    return null
  }

  return <PendingPanel />
}
