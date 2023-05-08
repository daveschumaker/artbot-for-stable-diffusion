import Head from 'next/head'
import React, { useCallback, useEffect, useState } from 'react'
import Switch from 'react-switch'
import { useStore } from 'statery'
import styled from 'styled-components'
import { useRouter } from 'next/router'

import useComponentState from '../../hooks/useComponentState'
import { fetchUserDetails } from '../../api/userInfo'
import { Button } from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import PageTitle from '../../components/UI/PageTitle'
import Select from '../../components/UI/Select'
import Tooltip from '../UI/Tooltip'
import {
  IWorkers,
  setWorkers,
  unsetUserInfo,
  userInfoStore
} from '../../store/userStore'
import Linker from '../../components/UI/Linker'
import SpinnerV2 from '../../components/Spinner'
import { sleep } from '../../utils/sleep'
import { clientHeader, getApiHostServer } from '../../utils/appUtils'
import MenuButton from '../../components/UI/MenuButton'
import { appInfoStore } from '../../store/appStore'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import ChevronDownIcon from '../../components/icons/ChevronDownIcon'
import AppSettings from '../../models/AppSettings'
import DropDownMenu from '../UI/DropDownMenu'
import DropDownMenuItem from '../UI/DropDownMenuItem'
import WorkerInfo from '../WorkerInfo'
import ImportExportPanel from '../ImportExportPanel'
import ExternalLinkIcon from '../icons/ExternalLinkIcon'
import { useEffectOnce } from '../../hooks/useEffectOnce'
import MaxWidth from '../UI/MaxWidth'
import AlertDialogBox from '../UI/AlertDialogBox'
import { db, generateThumbnails } from '../../utils/db'
import TextTooltipRow from '../UI/TextTooltipRow'
import EyeIcon from 'components/icons/EyeIcon'
import styles from './settings.module.css'

const Section = styled.div`
  padding-top: 16px;

  &:first-child {
    padding-top: 0;
  }
`

const SubSectionTitle = styled.div`
  padding-bottom: 8px;
`

const SettingsWrapper = styled.div`
  width: 100%;

  @media (min-width: 640px) {
    display: flex;
    flex-direction: row;
  }
`

const LinksPanel = styled.div`
  display: none;

  @media (min-width: 640px) {
    border-right: 1px solid white;
    display: flex;
    flex-direction: column;
    width: 280px;
  }
`

const LinksList = styled.ul`
  display: flex;
  flex-direction: column;
  row-gap: 8px;
`

const OptionsPanel = styled.div`
  width: 100%;

  @media (min-width: 640px) {
    display: flex;
    flex-direction: column;
    padding-left: 16px;
  }
`

const ShowOnMobile = styled.div`
  @media (min-width: 640px) {
    display: none;
  }
`

const SettingsPage = () => {
  const router = useRouter()
  const appStore = useStore(appInfoStore)
  const userStore = useStore(userInfoStore)

  const userState = useStore(userInfoStore)
  const {
    kudos_details,
    loggedIn,
    username,
    kudos,
    records = {},
    sharedKey = false,
    workers,
    worker_ids = []
  } = userState
  const { showBetaOption } = appStore

  const [processState, setProcessState] = useState('')
  const [totalToProcess, setTotalToProcess] = useState(0)
  const [currentProcessIdx, setCurrentProcessIdx] = useState(0)

  const [componentState, setComponentState] = useComponentState({
    allowNsfwImages: false,
    apiKey: '',
    apiErrorMsg: '',
    disableNewImageNotification: false,
    disableSnowflakes: false,
    enableGallerySwipe: true,
    loadingWorkerStatus: {},
    panel: 'stableHorde',
    runInBackground: false,
    saveInputOnCreate: false, // DEPRECATE

    savePromptOnCreate: false,
    saveSeedOnCreate: false,
    saveCanvasOnCreate: false,

    stayOnCreate: false,
    showOptionsMenu: false,
    showResetConfirmation: false,
    shareImagesExternally: AppSettings.get('shareImagesExternally'),
    useBeta: false,
    useWorkerId: '',
    useTrusted: true,
    imageDownloadFormat: 'jpg',
    slow_workers: true
  })

  const handleSetWorkerId = (e: React.ChangeEvent<HTMLInputElement>) => {
    const workerId = e.target.value || ''
    AppSettings.save('useWorkerId', workerId.trim())
    setComponentState({ useWorkerId: e.target.value })
  }

  const handleUpdateSelect = (key: string, obj: any) => {
    const { value } = obj
    AppSettings.save(key, value)
    setComponentState({ [key]: value })
  }

  const handleSwitchSelect = (key: string, value: boolean) => {
    AppSettings.save(key, value)
    setComponentState({ [key]: value })
  }

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

  const handleBetaSelect = (obj: any) => {
    const { value } = obj
    AppSettings.save('useBeta', value === 'true' ? 'userTrue' : 'userFalse')
    setComponentState({ useBeta: value })
  }

  useEffect(() => {
    const updateObj: any = {}

    updateObj.allowNsfwImages = AppSettings.get('allowNsfwImages') || false
    updateObj.apiKey = AppSettings.get('apiKey') || ''
    updateObj.runInBackground = AppSettings.get('runInBackground') || false
    updateObj.enableGallerySwipe =
      AppSettings.get('enableGallerySwipe') === false ? false : true

    updateObj.saveInputOnCreate = AppSettings.get('saveInputOnCreate') || false // DEPRECATE
    updateObj.savePromptOnCreate =
      AppSettings.get('savePromptOnCreate') || false
    updateObj.saveSeedOnCreate = AppSettings.get('saveSeedOnCreate') || false
    updateObj.saveCanvasOnCreate =
      AppSettings.get('saveCanvasOnCreate') || false

    updateObj.disableNewImageNotification =
      AppSettings.get('disableNewImageNotification') || false
    updateObj.stayOnCreate = AppSettings.get('stayOnCreate') || false
    updateObj.useBeta = AppSettings.get('useBeta') || false
    updateObj.useWorkerId = AppSettings.get('useWorkerId') || ''
    updateObj.useTrusted = AppSettings.get('useTrusted') || false
    updateObj.slow_workers =
      AppSettings.get('slow_workers') === false ? false : true
    updateObj.disableSnowflakes = AppSettings.get('disableSnowflakes') || false
    updateObj.shareImagesExternally =
      AppSettings.get('shareImagesExternally') || false
    updateObj.imageDownloadFormat =
      AppSettings.get('imageDownloadFormat') || 'jpg'

    // if (!userStore.username) {
    //   AppSettings.save('shareImagesExternally', true)
    //   updateObj.shareImagesExternally = true
    // }

    setComponentState({ ...updateObj })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchWorkerData = useCallback(async () => {
    if (Array.isArray(worker_ids)) {
      let workerInfo: IWorkers = {}

      for (const idx in worker_ids) {
        const workerRes = await fetch(
          `${getApiHostServer()}/api/v2/workers/${worker_ids[idx]}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Client-Agent': clientHeader()
            }
          }
        )
        const workerData = await workerRes.json()
        const { id } = workerData
        workerInfo[id] = { ...workerData }

        await sleep(500)
      }

      setWorkers(workerInfo)
    }
  }, [worker_ids])

  useEffect(() => {
    if (router.query.panel === 'workers') {
      fetchWorkerData()
    }
  }, [fetchWorkerData, router.query.panel])

  useEffectOnce(() => {
    setTimeout(() => {
      const apiKey = AppSettings.get('apiKey')

      if (!apiKey) {
        handleSwitchSelect('shareImagesExternally', true)
      }
    }, 250)
  })

  return (
    <div className="pb-[88px]">
      <Head>
        <title>Settings - ArtBot for Stable Diffusion</title>
        <meta name="twitter:title" content="ArtBot - Settings" />
      </Head>
      <div className="flex flex-row items-center w-full">
        <div className="inline-block w-1/4">
          <PageTitle>Settings</PageTitle>
        </div>
        <div className="flex flex-row justify-end w-3/4 items-start h-[38px] relative gap-2">
          <ShowOnMobile>
            <MenuButton
              active={componentState.showOptionsMenu}
              title="Click for more settings"
              onClick={() => {
                if (componentState.showOptionsMenu) {
                  setComponentState({
                    showOptionsMenu: false
                  })
                } else {
                  setComponentState({
                    showOptionsMenu: true
                  })
                }
              }}
            >
              <div className="flex flex-row gap-1 pr-2">
                {componentState.showOptionsMenu ? (
                  <ChevronDownIcon />
                ) : (
                  <ChevronRightIcon />
                )}
                {!router.query.panel &&
                  `
                AI Horde Settings
                `}
                {router.query.panel === 'workers' && `Manage Workers`}
                {router.query.panel === 'prefs' && `ArtBot Prefs`}
                {router.query.panel === 'import-export' && `Export`}
              </div>
            </MenuButton>
            {componentState.showOptionsMenu && (
              <DropDownMenu
                handleClose={() => {
                  setComponentState({
                    showOptionsMenu: false
                  })
                }}
              >
                <DropDownMenuItem
                  onClick={() => {
                    router.push(
                      //@ts-ignore
                      `/settings`
                    )
                  }}
                >
                  AI Horde settings
                </DropDownMenuItem>
                <DropDownMenuItem
                  onClick={() => {
                    router.push(
                      //@ts-ignore
                      `/settings?panel=workers`
                    )
                  }}
                >
                  Manage workers
                </DropDownMenuItem>
                <DropDownMenuItem
                  onClick={() => {
                    router.push(
                      //@ts-ignore
                      `/settings?panel=prefs`
                    )
                  }}
                >
                  ArtBot preferences
                </DropDownMenuItem>
                <DropDownMenuItem
                  onClick={() => {
                    router.push(
                      //@ts-ignore
                      `/settings?panel=import-export`
                    )
                  }}
                >
                  Export
                </DropDownMenuItem>
              </DropDownMenu>
            )}
          </ShowOnMobile>
        </div>
      </div>
      <SettingsWrapper>
        <LinksPanel>
          <LinksList>
            <li>
              <Linker href="/settings" passHref>
                Stable Horde Settings
              </Linker>
            </li>
            <li>
              <Linker href="/settings?panel=workers" passHref>
                Manage Workers
              </Linker>
            </li>
            <li>
              <Linker href="/settings?panel=prefs" passHref>
                ArtBot Preferences
              </Linker>
            </li>
            <li>
              <Linker href="/settings?panel=import-export" passHref>
                Export
              </Linker>
            </li>
          </LinksList>
        </LinksPanel>
        <OptionsPanel>
          {!router.query.panel ? (
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
                    <div className="text-[24px] font-[700] mt-[-8px]">
                      {username}
                    </div>
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
                      {worker_ids === null
                        ? 0
                        : worker_ids.length.toLocaleString()}
                    </div>
                  </div>
                </Section>
              )}
              <Section>
                <SubSectionTitle>
                  <TextTooltipRow>
                    <strong>API key</strong>
                    <Tooltip tooltipId="api-key-tooltip">
                      Leave blank for anonymous access. An API key gives higher
                      priority access to the AI Horde distributed cluster,
                      resulting in shorter image creation times.
                    </Tooltip>
                  </TextTooltipRow>
                  {!userStore.loggedIn && (
                    <div className="block w-full mt-2 mb-2 text-xs">
                      Leave blank for an anonymous user ID (
                      <strong>Note:</strong> image generation times will be much
                      slower). Register via the official{' '}
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
                      NOTE: This option is automatically enabled for users
                      without a valid API key.
                    </strong>
                  </div>
                </SubSectionTitle>
                <Switch
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
                    Workers attempt to block NSFW queries. Images flagged by
                    NSFW filter will be blacked out.
                  </div>
                </SubSectionTitle>
                <MaxWidth
                  // @ts-ignore
                  width="240px"
                >
                  <Switch
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
                    Request images from all workers or trusted only. Potential
                    risk if untrusted worker is a troll. Trusted is safer, but
                    potentially slower.
                  </div>
                </SubSectionTitle>
                <MaxWidth
                  // @ts-ignore
                  width="240px"
                >
                  <Select
                    isSearchable={false}
                    onChange={(obj: any) =>
                      handleUpdateSelect('useTrusted', obj)
                    }
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
                    Allow slower workers to pick up your requests. Disabling
                    this incurs an extra kudos cost.
                  </div>
                </SubSectionTitle>
                <MaxWidth
                  // @ts-ignore
                  width="240px"
                >
                  <Switch
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
              <Section>
                <SubSectionTitle>
                  <strong>Use a specific worker ID</strong>
                  <div className="block w-full mt-2 mb-2 text-xs">
                    Enter worker ID to send all of your image requests to a
                    specific worker. Useful for debugging purposes or testing
                    features available on particular workers.{' '}
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
              {showBetaOption && (
                <Section>
                  <SubSectionTitle>
                    Enable Beta
                    <div className="block w-full mt-2 mb-2 text-xs">
                      Will route all requests to Stable Horde&apos;s beta server
                      (if available). Used for testing purposes. Things may
                      break.
                    </div>
                  </SubSectionTitle>
                  <MaxWidth
                    // @ts-ignore
                    width="240px"
                  >
                    <Select
                      options={[
                        { value: true, label: 'Yes' },
                        { value: false, label: 'No' }
                      ]}
                      onChange={handleBetaSelect}
                      value={
                        componentState.useBeta
                          ? { value: true, label: 'Yes' }
                          : { value: false, label: 'No' }
                      }
                    />
                  </MaxWidth>
                </Section>
              )}
            </>
          ) : null}
          {router.query.panel === 'workers' ? (
            <>
              <Section>
                <PageTitle as="h2">Manage Workers</PageTitle>
                {componentState.apiKey && worker_ids === null ? (
                  <SpinnerV2 />
                ) : null}
                {(Array.isArray(worker_ids) && worker_ids.length === 0) ||
                !componentState.apiKey ? (
                  <>
                    <Section>
                      You currently have no active workers on Stable Horde.
                    </Section>
                    <Section>
                      <Linker
                        href="https://bit.ly/SimpleHordeColab"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="flex flex-row items-center gap-2">
                          Create your own Stable Horde worker using Google
                          Colab. <ExternalLinkIcon />
                        </div>
                      </Linker>
                    </Section>
                  </>
                ) : null}
                <Section className="flex flex-col gap-2">
                  {Object.keys(workers).map((key) => {
                    const worker = workers[key]

                    return (
                      <WorkerInfo
                        key={worker.id}
                        loadingWorkerStatus={componentState.loadingWorkerStatus}
                        setComponentState={setComponentState}
                        worker={worker}
                        workers={workers}
                      />
                    )
                  })}
                </Section>
              </Section>
            </>
          ) : null}
          {router.query.panel === 'prefs' ? (
            <>
              {componentState.showResetConfirmation && (
                <AlertDialogBox
                  title="Are you sure you want to reset your preferences?"
                  message="This option will reset all user settings found on this settings page. (e.g., API key, image download preferences, stored input values, etc). Your images will be safe. However, please save your API key before continuing."
                  onConfirmClick={() => {
                    localStorage.clear()
                    window.location.reload()
                  }}
                  closeModal={() => {
                    setComponentState({ showResetConfirmation: false })
                  }}
                />
              )}
              <Section>
                <PageTitle as="h2">ArtBot Preferences</PageTitle>
                <SubSectionTitle>
                  <strong>Stay on create page?</strong>
                  <div className="block w-full mt-2 mb-2 text-xs">
                    After clicking &quot;create&quot; on the image generation
                    page, stay on the page, rather than show pending items.
                  </div>
                </SubSectionTitle>
                <div className="flex flex-row items-center gap-2">
                  <Switch
                    onChange={() => {
                      if (componentState.stayOnCreate) {
                        handleSwitchSelect('stayOnCreate', false)
                      } else {
                        handleSwitchSelect('stayOnCreate', true)
                      }
                    }}
                    checked={componentState.stayOnCreate}
                  />
                </div>
              </Section>
              <Section>
                <SubSectionTitle>
                  <strong>Save on create?</strong>
                  <div className="block w-full mt-2 mb-2 text-xs">
                    After clicking &quot;create&quot; on the image generation
                    page, preserve the following settings. (All other settings
                    will be remembered.)
                  </div>
                </SubSectionTitle>
                <div className="flex flex-row items-center gap-2 mt-2">
                  <div className="w-[100px] text-sm">Prompt?</div>
                  <Switch
                    onChange={() => {
                      if (componentState.savePromptOnCreate) {
                        handleSwitchSelect('savePromptOnCreate', false)
                      } else {
                        handleSwitchSelect('savePromptOnCreate', true)
                      }
                    }}
                    checked={componentState.savePromptOnCreate}
                  />
                </div>
                <div className="flex flex-row items-center gap-2 mt-2">
                  <div className="w-[100px] text-sm">Seed?</div>
                  <Switch
                    onChange={() => {
                      if (componentState.saveSeedOnCreate) {
                        handleSwitchSelect('saveSeedOnCreate', false)
                      } else {
                        handleSwitchSelect('saveSeedOnCreate', true)
                      }
                    }}
                    checked={componentState.saveSeedOnCreate}
                  />
                </div>
                <div className="flex flex-row items-center gap-2 mt-2">
                  <div className="w-[100px] text-sm">Canvas</div>
                  <Switch
                    onChange={() => {
                      if (componentState.saveCanvasOnCreate) {
                        handleSwitchSelect('saveCanvasOnCreate', false)
                      } else {
                        handleSwitchSelect('saveCanvasOnCreate', true)
                      }
                    }}
                    checked={componentState.saveCanvasOnCreate}
                  />
                </div>
              </Section>
              <Section>
                <SubSectionTitle>
                  <strong>Preferred image format</strong>
                  <div className="block w-full mt-2 mb-2 text-xs">
                    Choose your preferred format when downloading images from
                    ArtBot
                  </div>
                </SubSectionTitle>
                <MaxWidth
                  // @ts-ignore
                  width="240px"
                >
                  <Select
                    isSearchable={false}
                    onChange={(obj: any) => {
                      handleUpdateSelect('imageDownloadFormat', obj)
                    }}
                    options={[
                      { value: 'jpg', label: 'jpg' },
                      { value: 'png', label: 'png' },
                      { value: 'webp', label: 'webp' }
                    ]}
                    value={{
                      value: componentState.imageDownloadFormat,
                      label: componentState.imageDownloadFormat
                    }}
                  />
                </MaxWidth>
              </Section>
              <Section>
                <SubSectionTitle>
                  <strong>Run in background?</strong>
                  <div className="block w-full mt-2 mb-2 text-xs">
                    By default, ArtBot only runs in the active browser tab in
                    order to try and help prevent your IP address from being
                    throttled. You may disable this behavior if you wish.
                  </div>
                </SubSectionTitle>
                <div className="flex flex-row items-center gap-2">
                  <Switch
                    onChange={() => {
                      if (componentState.runInBackground) {
                        handleSwitchSelect('runInBackground', false)
                      } else {
                        handleSwitchSelect('runInBackground', true)
                      }
                    }}
                    checked={componentState.runInBackground}
                  />
                </div>
              </Section>
              <Section>
                <SubSectionTitle>
                  <strong>Enable page swipe on image gallery page?</strong>
                  <div className="block w-full mt-2 mb-2 text-xs">
                    On mobile devices, this option allows you to swipe between
                    full pages of images on the{' '}
                    <Linker href="/images">images gallery page</Linker>.
                  </div>
                </SubSectionTitle>
                <MaxWidth
                  // @ts-ignore
                  width="240px"
                >
                  <Switch
                    onChange={() => {
                      if (componentState.enableGallerySwipe) {
                        handleSwitchSelect('enableGallerySwipe', false)
                      } else {
                        handleSwitchSelect('enableGallerySwipe', true)
                      }
                    }}
                    checked={componentState.enableGallerySwipe}
                  />
                </MaxWidth>
              </Section>
              <Section>
                <SubSectionTitle>
                  <strong>Disable new image notification?</strong>
                  <div className="block w-full mt-2 mb-2 text-xs">
                    This option disabled the new image notification toast that
                    pops up in the top right corner of the web app when ArtBot
                    receives a new image from the AI Horde backend.
                  </div>
                </SubSectionTitle>
                <MaxWidth
                  // @ts-ignore
                  width="240px"
                >
                  <Switch
                    onChange={() => {
                      handleSwitchSelect(
                        'disableNewImageNotification',
                        !componentState.disableNewImageNotification
                      )
                    }}
                    checked={componentState.disableNewImageNotification}
                  />
                </MaxWidth>
              </Section>
              <Section>
                <SubSectionTitle>
                  <strong>Generate thumbnails?</strong>
                  <div className="block w-full mt-2 mb-2 text-xs">
                    ArtBot recently implemented image thumbnails to help the
                    image gallery become more performant, especially on mobile
                    devices. Older images, created before 2023.03.06, will not
                    have image thumbnails. If you wish, you may manually kick
                    off this process.
                  </div>
                  <div className="block w-full mb-2 text-xs">
                    <strong>WARNING:</strong> Depending on the number of images,
                    this could take some time. (On my iPhone 14 Pro, it took
                    about 100 seconds to process 3,000 images)
                  </div>
                  {totalToProcess > 0 && (
                    <div className="block w-full mb-2 text-xs">
                      {processState} {currentProcessIdx} of {totalToProcess}{' '}
                      {processState === 'Analyzing' ? 'images' : 'thumbnails'}.
                    </div>
                  )}
                </SubSectionTitle>
                <MaxWidth
                  // @ts-ignore
                  width="240px"
                >
                  <Button
                    onClick={() => {
                      // @ts-ignore
                      generateThumbnails(({ total, current, state }) => {
                        setTotalToProcess(total)
                        setCurrentProcessIdx(current)
                        setProcessState(state)
                      })
                    }}
                  >
                    Generate thumbnails
                  </Button>
                </MaxWidth>
              </Section>
              <Section>
                <SubSectionTitle>
                  <strong>Download debugging logs?</strong>
                  <div className="block w-full mt-2 mb-2 text-xs">
                    This is really only used in case you&apos;re encountering
                    some issues with ArtBot and are asked to provide some
                    additional logs.
                  </div>
                </SubSectionTitle>
                <MaxWidth
                  // @ts-ignore
                  width="240px"
                >
                  <Button
                    onClick={() => {
                      //@ts-ignore
                      window.artbotDownloadLogs()
                    }}
                  >
                    Download
                  </Button>
                </MaxWidth>
              </Section>
              <Section>
                <SubSectionTitle>
                  <strong>Reset ArtBot settings in local storage?</strong>
                  <div className="block w-full mt-2 mb-2 text-xs">
                    In some instances, ArtBot settings could have been
                    corrupted. Use this option to reset all user settings found
                    on this settings page (e.g., API key, image download
                    preferences, stored input values, etc).
                  </div>
                  <div className="block w-full mt-2 mb-2 text-xs">
                    Please save your <strong>API key</strong> before doing this!
                  </div>
                  <div className="block w-full mt-2 mb-2 text-xs">
                    The prompt history database and image database will not be
                    touched and your images will still be available after this
                    reset.
                  </div>
                </SubSectionTitle>
                <MaxWidth
                  // @ts-ignore
                  width="240px"
                >
                  <Button
                    theme="secondary"
                    onClick={() =>
                      setComponentState({ showResetConfirmation: true })
                    }
                  >
                    Reset Preferences?
                  </Button>
                </MaxWidth>
              </Section>
              <Section>
                <SubSectionTitle>
                  <strong>Reset Input Cache?</strong>
                  <div className="block w-full mt-2 mb-2 text-xs">
                    In some instances, input cache settings could have been
                    corrupted. Use this option to reset cached data found on the
                    create page (e.g., steps, guidance, last used sampler, last
                    used model).
                  </div>
                  <div className="block w-full mt-2 mb-2 text-xs">
                    The prompt history database and image database will not be
                    touched and your images will still be available after this
                    reset.
                  </div>
                </SubSectionTitle>
                <MaxWidth
                  // @ts-ignore
                  width="240px"
                >
                  <Button
                    theme="secondary"
                    onClick={() => {
                      localStorage.removeItem('PromptInputSettings')
                      window.location.assign(`${window.location.origin}/artbot`)
                    }}
                  >
                    Reset Input Cache?
                  </Button>
                </MaxWidth>
              </Section>
              <Section>
                <SubSectionTitle>
                  <strong>Clear pending items table?</strong>
                  <div className="block w-full mt-2 mb-2 text-xs">
                    In some instances, a data corruption issue can occur on the
                    pending items page due to an unknown race condition that
                    hasn&apos;t been solved yet. When this happens, you will
                    encounter an error when trying to access the pending items
                    page.
                  </div>
                  <div className="block w-full mt-2 mb-2 text-xs">
                    The image database will not be touched and your images will
                    still be available after this reset.
                  </div>
                </SubSectionTitle>
                <MaxWidth
                  // @ts-ignore
                  width="240px"
                >
                  <Button
                    theme="secondary"
                    onClick={async () => {
                      await db.pending.clear()
                      window.location.assign(
                        `${window.location.origin}/artbot/pending`
                      )
                    }}
                  >
                    Reset Pending Items?
                  </Button>
                </MaxWidth>
              </Section>
              {/* <Section>
                <SubSectionTitle>
                  Disable snow flakes
                  <div className="block w-full mt-2 mb-2 text-xs">
                    Turn off snow flakes (a temporary feature enabled during
                    Christmastime here in California). NOTE: Requires page
                    reload.
                  </div>
                </SubSectionTitle>
                <MaxWidth
                  // @ts-ignore
                  width="240px"
                >
                  <Select
                    options={[
                      { value: true, label: 'Yes' },
                      { value: false, label: 'No' }
                    ]}
                    onChange={(obj: any) =>
                      handleUpdateSelect('disableSnowflakes', obj)
                    }
                    value={
                      componentState.disableSnowflakes
                        ? { value: true, label: 'Yes' }
                        : { value: true, label: 'No' }
                    }
                  />
                </MaxWidth>
              </Section> */}
            </>
          ) : null}
          {router.query.panel === 'import-export' ? (
            <>
              <ImportExportPanel />
            </>
          ) : null}
        </OptionsPanel>
      </SettingsWrapper>
    </div>
  )
}

export default SettingsPage
