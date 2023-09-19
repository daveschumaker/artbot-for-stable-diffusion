'use client'

import AppSettings from 'app/_data-models/AppSettings'
import { useEffect } from 'react'
import { checkDarkModePreference, updateTheme } from './controller'

export default function AppTheme() {
  useEffect(() => {
    const theme = AppSettings.get('theme') || 'system'
    updateTheme(theme)

    // Add a listener to detect changes to the dark mode setting
    const darkModeListener = window.matchMedia('(prefers-color-scheme: dark)')
    darkModeListener.addListener(checkDarkModePreference)

    // Clean up the listener on component unmount
    return () => {
      darkModeListener.removeListener(checkDarkModePreference)
    }
  }, [])

  return null
}
