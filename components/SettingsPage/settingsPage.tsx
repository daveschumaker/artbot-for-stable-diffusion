import Head from 'next/head'
import React, { useCallback, useEffect } from 'react'
import { useStore } from 'statery'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import NoSleep from 'nosleep.js'

import useComponentState from '../../hooks/useComponentState'
import { fetchUserDetails } from '../../api/userInfo'
import { Button } from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import PageTitle from '../../components/UI/PageTitle'
import Select from '../../components/UI/Select'
import Tooltip from '../../components/UI/Tooltip'
import {
  IWorkers,
  setWorkers,
  unsetUserInfo,
  userInfoStore
} from '../../store/userStore'
import Linker from '../../components/UI/Linker'
import SpinnerV2 from '../../components/Spinner'
import { sleep } from '../../utils/sleep'
import { getApiHostServer } from '../../utils/appUtils'
import MenuButton from '../../components/UI/MenuButton'
import { appInfoStore } from '../../store/appStore'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import ChevronDownIcon from '../../components/icons/ChevronDownIcon'
import AppSettings from '../../models/AppSettings'
import DropDownMenu from '../UI/DropDownMenu'
import DropDownMenuItem from '../UI/DropDownMenuItem'
import WorkerInfo from '../WorkerInfo'
import ImportExportPanel from '../ImportExportPanel'

const Section = styled.div`
  padding-top: 16px;

  &:first-child {
    padding-top: 0;
  }
`

const SubSectionTitle = styled.div`
  padding-bottom: 8px;
`

interface MaxWidthProps {
  maxWidth: number
}

const MaxWidth = styled.div<MaxWidthProps>`
  width: 100%;

  ${(props) =>
    props.maxWidth &&
    `
    max-width: ${props.maxWidth}px;
  `}
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

  const { worker_ids, workers } = userStore
  const { showBetaOption } = appStore

  const [componentState, setComponentState] = useComponentState({
    allowNsfwImages: false,
    apiKey: '',
    enableNoSleep: false,
    loadingWorkerStatus: {},
    panel: 'stableHorde',
    runInBackground: false,
    saveInputOnCreate: false,
    stayOnCreate: false,
    showOptionsMenu: false,
    useBeta: false,
    useTrusted: true
  })

  const handleNoSleep = (obj: any) => {
    const { value } = obj
    const noSleep = new NoSleep()

    if (value) {
      noSleep.disable()
      document.addEventListener(
        'click',
        function enableNoSleep() {
          document.removeEventListener('click', enableNoSleep, false)
          noSleep.enable()
        },
        false
      )
    } else {
      noSleep.disable()
    }

    AppSettings.save('enableNoSleep', value)
    setComponentState({ enableNoSleep: value })
  }

  const handleUpdateSelect = (key: string, obj: any) => {
    const { value } = obj
    AppSettings.save(key, value)
    setComponentState({ [key]: value })
  }

  const handleApiInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    AppSettings.save('apiKey', e.target.value)
    setComponentState({ apiKey: e.target.value })
  }

  const handleSaveApiKey = async () => {
    await fetchUserDetails(componentState.apiKey)
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
    updateObj.enableNoSleep = AppSettings.get('enableNoSleep') || false
    updateObj.runInBackground = AppSettings.get('runInBackground') || false
    updateObj.saveInputOnCreate = AppSettings.get('saveInputOnCreate') || false
    updateObj.stayOnCreate = AppSettings.get('stayOnCreate') || false
    updateObj.useBeta = AppSettings.get('useBeta') || false
    updateObj.useTrusted = AppSettings.get('useTrusted') || false

    setComponentState({ ...updateObj })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchWorkerData = useCallback(async () => {
    if (Array.isArray(worker_ids)) {
      let workerInfo: IWorkers = {}

      for (const idx in worker_ids) {
        const workerRes = await fetch(
          `${getApiHostServer()}/api/v2/workers/${worker_ids[idx]}`
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

  return (
    <div>
      <Head>
        <title>ArtBot - Settings</title>
      </Head>
      <div className="flex flex-row w-full items-center">
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
                Stable Horde Settings
                `}
                {router.query.panel === 'workers' && `Manage Workers`}
                {router.query.panel === 'prefs' && `ArtBot Prefs`}
                {router.query.panel === 'import-export' && `Export`}
              </div>
            </MenuButton>
            {componentState.showOptionsMenu && (
              <DropDownMenu>
                <DropDownMenuItem
                  onClick={() => {
                    setComponentState({
                      showOptionsMenu: false
                    })
                    router.push(
                      //@ts-ignore
                      `/settings`
                    )
                  }}
                >
                  Stable Horde settings
                </DropDownMenuItem>
                <DropDownMenuItem
                  onClick={() => {
                    setComponentState({
                      showOptionsMenu: false
                    })
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
                    setComponentState({
                      showOptionsMenu: false
                    })
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
                    setComponentState({
                      showOptionsMenu: false
                    })
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
                <PageTitle as="h2">Stable Horde Settings</PageTitle>
                <SubSectionTitle>
                  API key
                  <Tooltip width="220px">
                    Leave blank for anonymous access. An API key gives higher
                    priority access to the Stable Horde distributed cluster,
                    resulting in shorter image creation times.
                  </Tooltip>
                  <div className="block text-xs mt-2 mb-2 w-full">
                    Leave blank for an anonymous user ID. Register via{' '}
                    <a
                      href="https://stablehorde.net/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-500"
                    >
                      stablehorde.net
                    </a>
                    . Stored in browser using LocalStorage.
                  </div>
                </SubSectionTitle>
                <MaxWidth
                  // @ts-ignore
                  maxWidth="480"
                >
                  {userStore.loggedIn && (
                    <div className="block text-xs mt-2 mb-2 w-full">
                      Logged in as {userStore.username}
                      <br />
                      Kudos:{' '}
                      <span className="text-blue-500">
                        {userStore.kudos?.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <Input
                    type="text"
                    name="steps"
                    onChange={handleApiInput}
                    value={componentState.apiKey}
                  />
                  <div className="flex gap-2 mt-2 justify-start">
                    <Button
                      btnType="secondary"
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
                  Allow NSFW images
                  <div className="block text-xs mt-2 mb-2 w-full">
                    Workers attempt to block NSFW queries. Images flagged by
                    NSFW filter will be blacked out.
                  </div>
                </SubSectionTitle>
                <MaxWidth
                  // @ts-ignore
                  maxWidth="240"
                >
                  <Select
                    options={[
                      { value: true, label: 'Yes' },
                      { value: false, label: 'No' }
                    ]}
                    onChange={(obj: any) =>
                      handleUpdateSelect('allowNsfwImages', obj)
                    }
                    value={
                      componentState.allowNsfwImages
                        ? { value: true, label: 'Yes' }
                        : { value: false, label: 'No' }
                    }
                  />
                </MaxWidth>
              </Section>
              <Section>
                <SubSectionTitle>
                  Worker type
                  <div className="block text-xs mb-2 mt-2 w-full">
                    Request images from all workers or trusted only. Potential
                    risk if untrusted worker is a troll. Trusted is safer, but
                    potentially slower.
                  </div>
                </SubSectionTitle>
                <MaxWidth
                  // @ts-ignore
                  maxWidth="240"
                >
                  <Select
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
              {showBetaOption && (
                <Section>
                  <SubSectionTitle>
                    Enable Beta
                    <div className="block text-xs mt-2 mb-2 w-full">
                      Will route all requests to Stable Horde&apos;s beta server
                      (if available). Used for testing purposes. Things may
                      break.
                    </div>
                  </SubSectionTitle>
                  <MaxWidth
                    // @ts-ignore
                    maxWidth="240"
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
                  <Section>
                    You currently have no active workers on Stable Horde.
                  </Section>
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
              <Section>
                <PageTitle as="h2">ArtBot Preferences</PageTitle>
                <SubSectionTitle>
                  Stay on create page?
                  <div className="block text-xs mb-2 mt-2 w-full">
                    After clicking &quot;create&quot; on the image generation
                    page, stay on the page, rather than show pending items.
                  </div>
                </SubSectionTitle>
                <MaxWidth
                  // @ts-ignore
                  maxWidth="240"
                >
                  <Select
                    options={[
                      { value: true, label: 'Yes' },
                      { value: false, label: 'No' }
                    ]}
                    onChange={(obj: any) =>
                      handleUpdateSelect('stayOnCreate', obj)
                    }
                    value={
                      componentState.stayOnCreate
                        ? { value: true, label: 'Yes' }
                        : { value: true, label: 'No' }
                    }
                  />
                </MaxWidth>
              </Section>
              <Section>
                <SubSectionTitle>
                  Save input on create?
                  <div className="block text-xs mb-2 mt-2 w-full">
                    After clicking &quot;create&quot; on the image generation
                    page, preserve all settings. To remove settings between
                    generations, you will need to click the clear button.
                  </div>
                </SubSectionTitle>
                <MaxWidth
                  // @ts-ignore
                  maxWidth="240"
                >
                  <Select
                    options={[
                      { value: true, label: 'Yes' },
                      { value: false, label: 'No' }
                    ]}
                    onChange={(obj: any) =>
                      handleUpdateSelect('saveInputOnCreate', obj)
                    }
                    value={
                      componentState.saveInputOnCreate
                        ? { value: true, label: 'Yes' }
                        : { value: true, label: 'No' }
                    }
                  />
                </MaxWidth>
              </Section>
              <Section>
                <SubSectionTitle>
                  Run in background?
                  <div className="block text-xs mb-2 mt-2 w-full">
                    By default, ArtBot only runs in the active browser tab in
                    order to try and help prevent your IP address from being
                    throttled. You may disable this behavior if you wish.
                  </div>
                </SubSectionTitle>
                <MaxWidth
                  // @ts-ignore
                  maxWidth="240"
                >
                  <Select
                    options={[
                      { value: true, label: 'Yes' },
                      { value: false, label: 'No' }
                    ]}
                    onChange={(obj: any) =>
                      handleUpdateSelect('runInBackground', obj)
                    }
                    value={
                      componentState.runInBackground
                        ? { value: true, label: 'Yes' }
                        : { value: false, label: 'No' }
                    }
                  />
                </MaxWidth>
              </Section>
              <Section>
                <SubSectionTitle>
                  Stay awake?
                  <div className="block text-xs mb-2 mt-2 w-full">
                    On mobile devices, this option will keep your screen awake.
                    This is useful if you&apos;re generating a lot of images and
                    want the process to continue. <strong>Note:</strong> This
                    uses an audio API to stay awake, and will prevent you from
                    listening to other audio apps on your mobile device while on
                    this page.
                  </div>
                </SubSectionTitle>
                <MaxWidth
                  // @ts-ignore
                  maxWidth="240"
                >
                  <Select
                    options={[
                      { value: true, label: 'Yes' },
                      { value: false, label: 'No' }
                    ]}
                    onChange={handleNoSleep}
                    value={
                      componentState.enableNoSleep
                        ? { value: true, label: 'Yes' }
                        : { value: false, label: 'No' }
                    }
                  />
                </MaxWidth>
              </Section>
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
