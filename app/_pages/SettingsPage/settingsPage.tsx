'use client'

import Head from 'next/head'
import React, { useCallback, useEffect } from 'react'
import { useStore } from 'statery'
import styled from 'styled-components'
import { useRouter, useSearchParams } from 'next/navigation'

import useComponentState from 'app/_hooks/useComponentState'
import PageTitle from 'app/_components/PageTitle'
import { IWorkers, setWorkers, userInfoStore } from 'app/_store/userStore'
import Linker from 'app/_components/Linker'
import { sleep } from 'app/_utils/sleep'
import { clientHeader, getApiHostServer } from 'app/_utils/appUtils'
import MenuButton from 'app/_components/MenuButton'
import AppSettings from 'app/_data-models/AppSettings'
import { useEffectOnce } from 'app/_hooks/useEffectOnce'
import AiHordeSettingsPanel from './AiHordeSettingsPanel'
import WorkerSettingsPanel from './WorkerSettingsPanel'
import ArtBotSettingsPanel from './ArtBotSettingsPanel'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import DropDownMenu from 'app/_components/DropDownMenu/dropDownMenu'
import DropDownMenuItem from 'app/_components/DropDownMenuItem'
import ImportExportPanel from './ImportExportPanel'

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
  const searchParams = useSearchParams()

  const userState = useStore(userInfoStore)
  const { worker_ids = [] } = userState

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

    maxConcurrency: 5,
    imagesPerPage: 50,
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

  const handleSwitchSelect = (key: string, value: boolean) => {
    AppSettings.save(key, value)
    setComponentState({ [key]: value })
  }

  useEffect(() => {
    const updateObj: any = {}

    updateObj.allowNsfwImages = AppSettings.get('allowNsfwImages') || false
    updateObj.apiKey = AppSettings.get('apiKey') || ''
    updateObj.runInBackground = AppSettings.get('runInBackground') || false
    updateObj.enableGallerySwipe =
      AppSettings.get('enableGallerySwipe') === false ? false : true

    updateObj.maxConcurrency = AppSettings.get('maxConcurrency') || 5
    updateObj.imagesPerPage = AppSettings.get('imagesPerPage') || 50
    updateObj.theme = AppSettings.get('theme') || 'system'
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
    if (searchParams?.get('panel') === 'workers') {
      fetchWorkerData()
    }
  }, [fetchWorkerData, searchParams])

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
      <div
        className="flex flex-row items-center w-full"
        style={{ justifyContent: 'space-between' }}
      >
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
                  <IconChevronDown />
                ) : (
                  <IconChevronRight />
                )}
                {!searchParams?.get('panel') &&
                  `
                AI Horde Settings
                `}
                {searchParams?.get('panel') === 'workers' && `Manage Workers`}
                {searchParams?.get('panel') === 'prefs' && `ArtBot Prefs`}
                {searchParams?.get('panel') === 'import-export' && `Export`}
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
                  Import / Export
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
                AI Horde Settings
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
                Import / Export
              </Linker>
            </li>
          </LinksList>
        </LinksPanel>
        <OptionsPanel>
          {!searchParams?.get('panel') && (
            <AiHordeSettingsPanel
              componentState={componentState}
              setComponentState={setComponentState}
            />
          )}
          {searchParams?.get('panel') === 'workers' && (
            <WorkerSettingsPanel
              componentState={componentState}
              setComponentState={setComponentState}
            />
          )}
          {searchParams?.get('panel') === 'prefs' && (
            <ArtBotSettingsPanel
              componentState={componentState}
              setComponentState={setComponentState}
            />
          )}
          {searchParams?.get('panel') === 'import-export' ? (
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
