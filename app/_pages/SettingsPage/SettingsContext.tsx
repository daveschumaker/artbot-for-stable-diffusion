'use client'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react'
import AppSettings, { SETTINGS_EVENT } from 'app/_data-models/AppSettings'
import {
  settingsValues,
  validSetting,
  SettingsValues
} from 'app/_data-models/settingsSchema'
import { SELECTION_KEY } from 'app/_backup/platform'
import { updateTheme } from 'app/_modules/AppTheme/controller'
import { setUseAllowedWorkers, setUseBlockedWorkers } from 'app/_store/appStore'

function useSettingsState() {
  const [values, setValues] = useState(() => settingsValues(AppSettings.load()))
  const [apiKeyDraft, setApiKeyDraft] = useState(values.apiKey)
  useEffect(() => {
    setApiKeyDraft(values.apiKey)
  }, [values.apiKey])
  const [status, setStatus] = useState(
    'Preferences save automatically on this device.'
  )
  const [error, setError] = useState('')
  useEffect(() => {
    const refresh = () => setValues(settingsValues(AppSettings.load()))
    const external = (event: StorageEvent) => {
      if (
        event.key === null ||
        ['appConfig', 'theme', SELECTION_KEY].includes(event.key)
      ) {
        refresh()
        setStatus('Settings updated from another window.')
      }
    }
    window.addEventListener(SETTINGS_EVENT, refresh)
    window.addEventListener('storage', external)
    // A sibling tab can save between the initial render and subscription.
    // Subscribe first, then reread so that update cannot be lost.
    refresh()
    return () => {
      window.removeEventListener(SETTINGS_EVENT, refresh)
      window.removeEventListener('storage', external)
    }
  }, [])
  useEffect(() => {
    updateTheme(values.theme)
  }, [values.theme])
  useEffect(() => {
    setUseAllowedWorkers(values.useAllowedWorkers)
    setUseBlockedWorkers(values.useBlockedWorkers)
  }, [values.useAllowedWorkers, values.useBlockedWorkers])
  const saveMany = useCallback((updates: Partial<SettingsValues>) => {
    try {
      for (const [key, value] of Object.entries(updates))
        if (
          !Object.hasOwn(SETTINGS_DEFAULT_KEYS, key) ||
          !validSetting(key as keyof SettingsValues, value)
        )
          throw new Error('Invalid setting value')
      AppSettings.saveAll({ ...AppSettings.readForUpdate(), ...updates })
      setError('')
      setStatus('Saved on this device.')
      return true
    } catch (error) {
      setError(
        (error as Error).name === 'QuotaExceededError'
          ? 'Settings were not saved because browser storage is full. Your previous values were kept.'
          : 'Settings were not saved. ' + (error as Error).message
      )
      return false
    }
  }, [])
  const save = useCallback(
    <K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) =>
      saveMany({ [key]: value }),
    [saveMany]
  )
  return { values, save, saveMany, status, error, apiKeyDraft, setApiKeyDraft }
}
const SETTINGS_DEFAULT_KEYS = settingsValues({})
const Context = createContext<ReturnType<typeof useSettingsState> | null>(null)
export function SettingsProvider({ children }: { children: ReactNode }) {
  const state = useSettingsState()
  return (
    <Context.Provider value={state}>
      <p
        role="status"
        aria-label="Settings save status"
        className="text-sm my-3"
      >
        {state.status}
      </p>
      {state.error && (
        <p role="alert" className="my-3 text-red-600">
          {state.error}
        </p>
      )}
      {children}
    </Context.Provider>
  )
}
export function useSettings() {
  const state = useContext(Context)
  if (!state) throw new Error('Settings must be used within SettingsProvider')
  return state
}
