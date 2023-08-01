'use client'

import AppSettings from 'models/AppSettings'
import { useEffect } from 'react'

export default function AppTheme() {
  // const [isDarkMode, setIsDarkMode] = useState(false)

  // Function to check if dark mode is active using media query
  const checkDarkModePreference = () => {
    const theme = AppSettings.get('theme') || 'system'

    if (theme !== 'system') return

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark')
      // setIsDarkMode(true)
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
      // setIsDarkMode(false)
    }
  }

  useEffect(() => {
    const theme = AppSettings.get('theme') || 'system'

    if (theme === 'system') {
      checkDarkModePreference()
    } else if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    } else if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    }

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
