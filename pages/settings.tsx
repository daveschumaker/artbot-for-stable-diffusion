import Head from 'next/head'
import React, { useEffect } from 'react'
import { useStore } from 'statery'
import styled from 'styled-components'

import useComponentState from '../hooks/useComponentState'
import { trackEvent } from '../api/telemetry'
import { fetchUserDetails } from '../api/userInfo'
import { Button } from '../components/UI/Button'
import Input from '../components/UI/Input'
import PageTitle from '../components/UI/PageTitle'
import Select from '../components/UI/Select'
import Tooltip from '../components/UI/Tooltip'
import { useEffectOnce } from '../hooks/useEffectOnce'
import { unsetUserInfo, userInfoStore } from '../store/userStore'

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
const SettingsPage = () => {
  const userStore = useStore(userInfoStore)
  const [componentState, setComponentState] = useComponentState({
    apiKey: '',
    preserveCreate: 'false',
    runBackground: 'false',
    useTrusted: 'true',
    useNsfw: 'false'
  })

  const handleApiInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem('apikey', e.target.value)
    setComponentState({ apiKey: e.target.value })
  }

  const handleSaveApiKey = async () => {
    await fetchUserDetails(componentState.apiKey)
  }

  const handlePreserveCreate = (obj: any) => {
    const { value } = obj
    localStorage.setItem('preserveCreateSettings', value)
    setComponentState({ preserveCreate: value })
  }

  const handleRunBackground = (obj: any) => {
    const { value } = obj
    localStorage.setItem('runBackground', value)
    setComponentState({ runBackground: value })
  }

  const handleTrustedSelect = (obj: any) => {
    const { value } = obj
    localStorage.setItem('useTrusted', value)
    setComponentState({ useTrusted: value })
  }

  const handleNsfwSelect = (obj: any) => {
    const { value } = obj
    localStorage.setItem('allowNsfwImages', value)
    setComponentState({ useNsfw: value })
  }

  useEffect(() => {
    if (localStorage.getItem('apikey')) {
      setComponentState({ apiKey: localStorage.getItem('apikey') || '' })
    }

    if (localStorage.getItem('useTrusted') === 'true') {
      setComponentState({
        useTrusted: localStorage.getItem('useTrusted')
      })
    } else {
      setComponentState({
        useTrusted: false
      })
    }

    if (localStorage.getItem('allowNsfwImages') === 'true') {
      setComponentState({
        useNsfw: localStorage.getItem('allowNsfwImages')
      })
    } else {
      setComponentState({
        useNsfw: false
      })
    }

    if (localStorage.getItem('preserveCreateSettings') === 'true') {
      setComponentState({
        preserveCreate: localStorage.getItem('preserveCreateSettings')
      })
    } else {
      setComponentState({
        preserveCreate: false
      })
    }

    if (localStorage.getItem('runBackground') === 'true') {
      setComponentState({
        runBackground: localStorage.getItem('runBackground')
      })
    } else {
      setComponentState({
        runBackground: false
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffectOnce(() => {
    trackEvent({
      event: 'PAGE_VIEW',
      context: '/pages/settings'
    })
  })

  return (
    <div>
      <Head>
        <title>ArtBot - Settings</title>
      </Head>
      <PageTitle>Settings</PageTitle>
      <Section>
        <SubSectionTitle>Save input on create?</SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          maxWidth="240"
        >
          <Select
            options={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' }
            ]}
            onChange={handlePreserveCreate}
            value={
              componentState.preserveCreate === 'true'
                ? { value: 'true', label: 'Yes' }
                : { value: 'false', label: 'No' }
            }
          />
          <div className="block text-xs mt-2 w-full">
            After clicking &quot;create&quot; on the image generation page,
            preserve all settings. To remove settings between generations, you
            will need to click the clear button.
          </div>
        </MaxWidth>
      </Section>
      <Section>
        <SubSectionTitle>Run in background?</SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          maxWidth="240"
        >
          <Select
            options={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' }
            ]}
            onChange={handleRunBackground}
            value={
              componentState.runBackground === 'true'
                ? { value: 'true', label: 'Yes' }
                : { value: 'false', label: 'No' }
            }
          />
          <div className="block text-xs mt-2 w-full">
            By default, ArtBot only runs in the active browser tab in order to
            try and help prevent your IP address from being throttled. You may
            disable this behavior if you wish.
          </div>
        </MaxWidth>
      </Section>
      <Section>
        <SubSectionTitle>Allow NSFW images</SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          maxWidth="240"
        >
          <Select
            options={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' }
            ]}
            onChange={handleNsfwSelect}
            value={
              componentState.useNsfw === 'true'
                ? { value: 'true', label: 'Yes' }
                : { value: 'false', label: 'No' }
            }
          />
          <div className="block text-xs mt-2 w-full">
            Workers attempt to block NSFW queries. Images flagged by NSFW filter
            will be blacked out.
          </div>
        </MaxWidth>
      </Section>
      <Section>
        <SubSectionTitle>Worker type</SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          maxWidth="240"
        >
          <Select
            onChange={handleTrustedSelect}
            options={[
              { value: 'false', label: 'All Workers' },
              { value: 'true', label: 'Trusted Only' }
            ]}
            value={
              componentState.useTrusted === 'true'
                ? { value: 'true', label: 'Trusted Only' }
                : { value: 'false', label: 'All Workers' }
            }
          />
          <div className="block text-xs mt-2 w-full">
            Request images from all workers or trusted only. Potential risk if
            untrusted worker is a troll. Trusted is safer, but potentially
            slower.
          </div>
        </MaxWidth>
      </Section>
      <Section>
        <SubSectionTitle>
          API key
          <Tooltip width="220px">
            Leave blank for anonymous access. An API key gives higher priority
            access to the Stable Horde distributed cluster, resulting in shorter
            image creation times.
          </Tooltip>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          maxWidth="480"
        >
          {userStore.loggedIn && (
            <div className="block text-xs mt-2 mb-2 w-full">
              Logged in as {userStore.username}
              <br />
              Kudos: <span className="text-blue-500">{userStore.kudos}</span>
            </div>
          )}
          <Input
            type="text"
            name="steps"
            onChange={handleApiInput}
            value={componentState.apiKey}
          />
          <div className="block text-xs mt-2 w-full">
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
          <div className="flex gap-2 mt-2 justify-end">
            <Button
              btnType="secondary"
              onClick={() => {
                unsetUserInfo()
                setComponentState({ apiKey: '' })
                localStorage.setItem('apikey', '')
              }}
            >
              Clear
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
    </div>
  )
}

export default SettingsPage
