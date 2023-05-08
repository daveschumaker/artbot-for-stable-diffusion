import PageTitle from 'components/UI/PageTitle'
import Section from 'components/UI/Section'
import { useStore } from 'statery'
import { unsetUserInfo, userInfoStore } from 'store/userStore'
import styles from './settings.module.css'
import SubSectionTitle from 'components/UI/SubSectionTitle'
import TextTooltipRow from 'components/UI/TextTooltipRow'
import Tooltip from 'components/Tooltip'
import MaxWidth from 'components/UI/MaxWidth'
import Input from 'components/UI/Input'
import { Button } from 'components/UI/Button'
import EyeIcon from 'components/icons/EyeIcon'
import Linker from 'components/UI/Linker'
import ReactSwitch from 'react-switch'
import Select from 'components/UI/Select'
import AppSettings from 'models/AppSettings'
import React from 'react'
import { fetchUserDetails } from 'api/userInfo'
import SharedKeys from './SharedKeys'
import WorkerBlocklist from './WorkerBlocklist'

const AiHordeSettingsPanel = ({ componentState, setComponentState }: any) => {
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

  const handleApiInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComponentState({ apiKey: e.target.value })
  }

  const handleSaveApiKey = async () => {
    try {
      const data = await fetchUserDetails(componentState.apiKey)
      const { success } = data

      if (success === true) {
        AppSettings.save('apiKey', componentState.apiKey)
        setComponentState({ apiErrorMsg: '' })
      } else if (success === false) {
        setComponentState({ apiErrorMsg: 'Error: Unable to load API key.' })
        handleSwitchSelect('shareImagesExternally', true)
        AppSettings.delete('apiKey')
      }
    } catch (err) {
      setComponentState({ apiErrorMsg: 'Error: Unable to load API key.' })
      handleSwitchSelect('shareImagesExternally', true)
      AppSettings.delete('apiKey')
    }
  }

  const handleSwitchSelect = (key: string, value: boolean) => {
    AppSettings.save(key, value)
    setComponentState({ [key]: value })
  }

  const handleUpdateSelect = (key: string, obj: any) => {
    const { value } = obj
    AppSettings.save(key, value)
    setComponentState({ [key]: value })
  }

  const handleSetWorkerId = (e: React.ChangeEvent<HTMLInputElement>) => {
    const workerId = e.target.value || ''
    AppSettings.save('useWorkerId', workerId.trim())
    setComponentState({ useWorkerId: e.target.value })
  }

  return (
    <>
      <Section>
        <PageTitle as="h2">AI Horde Settings</PageTitle>
      </Section>
      {loggedIn && username && sharedKey && (
        <Section>
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
        <Section>
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
              {records.request.image.toLocaleString()}
            </div>
          </div>
          <div className={styles['user-info-wrapper']}>
            <div className={styles['user-info-wrapper-title']}>
              Images generated from your workers
            </div>
            <div className={styles['user-info-wrapper-details']}>
              {records.fulfillment.image.toLocaleString()}
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
      <Section>
        <SubSectionTitle>
          <TextTooltipRow>
            <strong>API key</strong>
            <Tooltip tooltipId="api-key-tooltip">
              Leave blank for anonymous access. An API key gives higher priority
              access to the AI Horde distributed cluster, resulting in shorter
              image creation times.
            </Tooltip>
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
          {componentState.apiErrorMsg && (
            <div className="flex flex-row gap-2 font-bold text-red-500">
              {componentState.apiErrorMsg}
            </div>
          )}
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          width="480px"
        >
          <div className="flex flex-row gap-2">
            <Input
              type={componentState.showApiKey ? 'text' : 'password'}
              name="steps"
              onChange={handleApiInput}
              value={componentState.apiKey}
            />
            <Button
              onClick={() => {
                if (componentState.showApiKey) {
                  setComponentState({ showApiKey: false })
                } else {
                  setComponentState({ showApiKey: true })
                }
              }}
            >
              <EyeIcon />
            </Button>
          </div>
          <div className="flex justify-start gap-2 mt-2">
            <Button
              theme="secondary"
              onClick={() => {
                unsetUserInfo()
                setComponentState({ apiKey: '' })
                AppSettings.save('apiKey', '')
              }}
            >
              Log out
            </Button>
            <Button
              onClick={() => {
                handleSaveApiKey()
              }}
            >
              Save
            </Button>
          </div>
        </MaxWidth>
      </Section>
      {loggedIn && <SharedKeys></SharedKeys>}
      <Section>
        <SubSectionTitle>
          <strong>Share images with LAION</strong>
          <div className="block w-full mt-2 mb-2 text-xs">
            Automatically and anonymously share images with LAION (the
            non-profit that helped to train Stable Diffusion) for use in
            aesthetic training in order to improve future models. See{' '}
            <Linker
              href="https://discord.com/channels/781145214752129095/1038867597543882894"
              target="_blank"
              rel="noopener noreferrer"
            >
              this announcement
            </Linker>{' '}
            on Discord for more information.{' '}
            <strong>
              NOTE: This option is automatically enabled for users without a
              valid API key.
            </strong>
          </div>
        </SubSectionTitle>
        <ReactSwitch
          disabled={!componentState.apiKey}
          onChange={() => {
            if (componentState.shareImagesExternally) {
              handleSwitchSelect('shareImagesExternally', false)
            } else {
              handleSwitchSelect('shareImagesExternally', true)
            }
          }}
          checked={componentState.shareImagesExternally}
        />
      </Section>
      <Section>
        <SubSectionTitle>
          <strong>Allow NSFW images</strong>
          <div className="block w-full mt-2 mb-2 text-xs">
            Workers attempt to block NSFW queries. Images flagged by NSFW filter
            will be blacked out.
          </div>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          width="240px"
        >
          <ReactSwitch
            onChange={() => {
              if (componentState.allowNsfwImages) {
                handleSwitchSelect('allowNsfwImages', false)
              } else {
                handleSwitchSelect('allowNsfwImages', true)
              }
            }}
            checked={componentState.allowNsfwImages}
          />
        </MaxWidth>
      </Section>
      <Section>
        <SubSectionTitle>
          <strong>Worker type</strong>
          <div className="block w-full mt-2 mb-2 text-xs">
            Request images from all workers or trusted only. Potential risk if
            untrusted worker is a troll. Trusted is safer, but potentially
            slower.
          </div>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          width="240px"
        >
          <Select
            isSearchable={false}
            onChange={(obj: any) => handleUpdateSelect('useTrusted', obj)}
            options={[
              { value: false, label: 'All Workers' },
              { value: true, label: 'Trusted Only' }
            ]}
            value={
              componentState.useTrusted
                ? { value: true, label: 'Trusted Only' }
                : { value: false, label: 'All Workers' }
            }
          />
        </MaxWidth>
      </Section>
      <Section>
        <SubSectionTitle>
          <strong>Allow slow workers</strong>
          <div className="block w-full mt-2 mb-2 text-xs">
            Allow slower workers to pick up your requests. Disabling this incurs
            an extra kudos cost.
          </div>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          width="240px"
        >
          <ReactSwitch
            onChange={() => {
              if (componentState.slow_workers) {
                handleSwitchSelect('slow_workers', false)
              } else {
                handleSwitchSelect('slow_workers', true)
              }
            }}
            checked={componentState.slow_workers !== false}
          />
        </MaxWidth>
      </Section>
      <WorkerBlocklist />
      <Section>
        <SubSectionTitle>
          <strong>Use a specific worker ID</strong>
          <div className="block w-full mt-2 mb-2 text-xs">
            Enter worker ID to send all of your image requests to a specific
            worker. Useful for debugging purposes or testing features available
            on particular workers.{' '}
            <Linker href="/info/workers" passHref>
              View all available workers
            </Linker>
          </div>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          width="480px"
        >
          <Input
            type="text"
            name="steps"
            onChange={handleSetWorkerId}
            value={componentState.useWorkerId}
            placeholder="Worker ID"
          />
          <div className="flex justify-start gap-2 mt-2">
            <Button
              theme="secondary"
              onClick={() => {
                unsetUserInfo()
                setComponentState({ useWorkerId: '' })
                AppSettings.save('useWorkerId', '')
              }}
            >
              Clear
            </Button>
            <Button onClick={() => {}}>Save</Button>
          </div>
        </MaxWidth>
      </Section>
    </>
  )
}

export default AiHordeSettingsPanel
