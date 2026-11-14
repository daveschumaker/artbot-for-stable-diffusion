'use client'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import PageTitle from 'app/_components/PageTitle'
import Section from 'app/_components/Section'
import { useStore } from 'statery'
import { unsetUserInfo, userInfoStore } from 'app/_store/userStore'
import styles from './settings.module.css'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import TextTooltipRow from 'app/_components/TextTooltipRow'
import TooltipComponent from 'app/_components/TooltipComponent'
import MaxWidth from 'app/_components/MaxWidth'
import Input from 'app/_components/Input'
import { Button } from 'app/_components/Button'
import SharedKeys from './SharedKeys'
import { IconEye } from '@tabler/icons-react'
import {
  validateApiKey,
  publishValidatedUser,
  fetchUserDetailsV2
} from 'app/_api/fetchUserDetailsV2'
import { useSettings } from './SettingsContext'
const AiHordeSettingsPanel = () => {
  const {
    values,
    save,
    apiKeyDraft: draft,
    setApiKeyDraft: setDraft
  } = useSettings()
  const userStore = useStore(userInfoStore)
  const {
    kudos_details,
    loggedIn,
    username,
    kudos,
    records = {},
    sharedKey = false,
    worker_ids = []
  } = userStore
  const [showKey, setShowKey] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const request = useRef<AbortController | null>(null)
  useEffect(() => {
    request.current?.abort()
    request.current = null
    setBusy(false)
  }, [values.apiKey])
  useEffect(() => () => request.current?.abort(), [])
  const login = async () => {
    if (request.current || !draft.trim()) return
    const controller = new AbortController()
    request.current = controller
    setBusy(true)
    setError('')
    setMessage('')
    const key = draft.trim()
    let timedOut = false
    const timeout = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, 30000)
    try {
      const user = await validateApiKey(key, controller.signal)
      if (controller.signal.aborted) return
      if (!user.username)
        throw new Error('The server did not recognize this API key.')
      if (save('apiKey', key)) {
        // Update the cached-publisher fence only after durable credential saving.
        publishValidatedUser(key, user)
        setMessage('API key saved on this device.')
      }
    } catch (error) {
      if (timedOut)
        setError(
          'API key verification timed out. Your saved key was kept. Try again when the connection is available.'
        )
      else if (!controller.signal.aborted)
        setError(
          'Unable to verify API key. Check the key and connection, then try again. ' +
            (error as Error).message
        )
    } finally {
      clearTimeout(timeout)
      if (request.current === controller) {
        request.current = null
        setBusy(false)
      }
    }
  }
  const logout = () => {
    request.current?.abort()
    request.current = null
    if (save('apiKey', '')) {
      void fetchUserDetailsV2('')
      unsetUserInfo()
      setDraft('')
      setMessage('Logged out on this device.')
    }
  }
  return (
    <>
      <Section pb={12}>
        <PageTitle as="h2">AI Horde Settings</PageTitle>
      </Section>
      {loggedIn && username && sharedKey && (
        <Section pb={12}>
          <div className="flex flex-col gap-[1px]">
            <div className="text-[16px]">Welcome back,</div>
            <div className="text-[24px] font-[700] mt-[-8px]">
              Shared key provided by {username}
            </div>
          </div>
          <div className={styles['user-info-wrapper']}>
            <div className={styles['user-info-wrapper-title']}>
              Available Kudos
            </div>
            <div className={styles['user-info-wrapper-details']}>
              {kudos.toLocaleString()}
            </div>
          </div>
        </Section>
      )}
      {loggedIn && username && !sharedKey && (
        <Section pb={12}>
          <div className="flex flex-col gap-[1px]">
            <div className="text-[16px]">Welcome back,</div>
            <div className="text-[24px] font-[700] mt-[-8px]">{username}</div>
          </div>
          <div className={styles['user-info-wrapper']}>
            <div className={styles['user-info-wrapper-title']}>
              Currently Available Kudos
            </div>
            <div className={styles['user-info-wrapper-details']}>
              {kudos.toLocaleString()}
            </div>
          </div>
          <div className={styles['user-info-wrapper']}>
            <div className={styles['user-info-wrapper-title']}>
              Kudos gifted to you
            </div>
            <div className={styles['user-info-wrapper-details']}>
              {Math.abs(kudos_details.received).toLocaleString()}
            </div>
          </div>
          <div className={styles['user-info-wrapper']}>
            <div className={styles['user-info-wrapper-title']}>
              Kudos gifted to others
            </div>
            <div className={styles['user-info-wrapper-details']}>
              {Math.abs(kudos_details.gifted).toLocaleString()}
            </div>
          </div>
          <div className={styles['user-info-wrapper']}>
            <div className={styles['user-info-wrapper-title']}>
              Images you&apos;ve requested
            </div>
            <div className={styles['user-info-wrapper-details']}>
              {(records.request?.image ?? 0).toLocaleString()}
            </div>
          </div>
          <div className={styles['user-info-wrapper']}>
            <div className={styles['user-info-wrapper-title']}>
              Images generated from your workers
            </div>
            <div className={styles['user-info-wrapper-details']}>
              {(records.fulfillment?.image ?? 0).toLocaleString()}
            </div>
          </div>
          <div className={styles['user-info-wrapper']}>
            <div className={styles['user-info-wrapper-title']}>
              Your Workers
            </div>
            <div className={styles['user-info-wrapper-details']}>
              {worker_ids === null ? 0 : worker_ids.length.toLocaleString()}
            </div>
          </div>
        </Section>
      )}
      <Section pb={12}>
        <SubSectionTitle>
          <TextTooltipRow>
            <label htmlFor="account-api-key" className="font-bold">
              API key
            </label>
            <TooltipComponent tooltipId="api-key-tooltip">
              Leave blank for anonymous access. An API key gives higher priority
              access to the AI Horde distributed cluster, resulting in shorter
              image creation times.
            </TooltipComponent>
          </TextTooltipRow>
          {!userStore.loggedIn && (
            <div className="block w-full mt-2 mb-2 text-xs">
              Leave blank for an anonymous user ID (<strong>Note:</strong> image
              generation times will be much slower). Register via the official{' '}
              <a
                href="https://aihorde.net/register"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-500"
              >
                aihorde.net
              </a>{' '}
              website. API key is stored in your browser cache using
              LocalStorage.
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="flex flex-row gap-2 font-bold text-red-500"
            >
              {error}
            </div>
          )}
        </SubSectionTitle>
        <MaxWidth style={{ maxWidth: '480px' }}>
          <div className="flex flex-row gap-2">
            <Input
              type={showKey ? 'text' : 'password'}
              id="account-api-key"
              name="apiKey"
              disabled={busy}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void login()
                }
              }}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setDraft(event.target.value)
              }
              value={draft}
            />
            <Button
              title={showKey ? 'Hide API key' : 'Show API key'}
              onClick={() => setShowKey(!showKey)}
            >
              <IconEye />
            </Button>
          </div>
          <div className="flex justify-start gap-2 mt-2">
            <Button theme="secondary" disabled={busy} onClick={logout}>
              Log out
            </Button>
            <Button
              disabled={busy || !draft.trim()}
              onClick={() => void login()}
            >
              {busy ? 'Checking API key…' : 'Save API key'}
            </Button>
          </div>
        </MaxWidth>
      </Section>
      {loggedIn && (
        <Section pb={12}>
          <SharedKeys />
        </Section>
      )}
      <p role="status" aria-label="API key status" className="text-sm my-3">
        {message ||
          'API key edits require Save API key. Other preferences save automatically.'}
      </p>
    </>
  )
}
export default AiHordeSettingsPanel
