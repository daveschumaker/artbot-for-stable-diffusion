import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { fetchUserDetails } from '../api/userInfo'
import { Button } from '../components/Button'
import Input from '../components/Input'
import PageTitle from '../components/PageTitle'
import Select from '../components/Select'
import Tooltip from '../components/Tooltip'
import { setTrustedUser } from '../store/appStore'

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
  const [apiKey, setApiKey] = useState('')
  const [useTrusted, setUseTrusted] = useState('false')
  const [useNsfw, setUseNsfw] = useState('false')

  const handleApiInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem('apikey', e.target.value)
    setApiKey(e.target.value)
  }

  const handleSaveApiKey = async () => {
    await fetchUserDetails(apiKey)
  }

  const handleTrustedSelect = (obj: any) => {
    const { value } = obj
    localStorage.setItem('useTrusted', value)
    setUseTrusted(value)
  }

  const handleNsfwSelect = (obj: any) => {
    const { value } = obj
    localStorage.setItem('allowNsfwImages', value)
    setUseNsfw(value)
  }

  useEffect(() => {
    if (localStorage.getItem('apikey')) {
      setApiKey(localStorage.getItem('apikey') || '')
    }

    if (localStorage.getItem('useTrusted')) {
      setUseTrusted(localStorage.getItem('useTrusted') || 'false')
    }

    if (localStorage.getItem('allowNsfwImages')) {
      setUseNsfw(localStorage.getItem('allowNsfwImages') || 'false')
    }
  }, [])

  return (
    <div>
      <Head>
        <title>ArtBot - Settings</title>
      </Head>
      <PageTitle>Settings</PageTitle>
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
              useNsfw === 'true'
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
              useTrusted === 'true'
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
          <Input
            type="text"
            name="steps"
            onChange={handleApiInput}
            value={apiKey}
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
                setTrustedUser(false)
                setApiKey('')
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
