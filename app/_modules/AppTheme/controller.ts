import AppSettings from 'app/_data-models/AppSettings'

export const checkDarkModePreference = () => {
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

export const updateTheme = (theme: string = 'system') => {
  if (theme === 'system') {
    checkDarkModePreference()
  } else if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light')
  } else if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
  }
}
