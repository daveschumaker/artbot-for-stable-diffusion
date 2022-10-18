import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import { useStore } from 'statery'
import { fetchUserDetails } from '../api/userInfo'
import { Button } from '../components/Button'
import Input from '../components/Input'
import PageTitle from '../components/PageTitle'
import Select from '../components/Select'
import Tooltip from '../components/Tooltip'
import { appInfoStore, setTrustedUser } from '../store/appStore'

const SettingsPage = () => {
  const appState = useStore(appInfoStore)
  const { trusted } = appState

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

  // @ts-ignore
  const handleTrustedSelect = (e) => {
    localStorage.setItem('useTrusted', e.target.value)
    setUseTrusted(e.target.value)
  }

  // @ts-ignore
  const handleNsfwSelect = (e) => {
    localStorage.setItem('allowNsfwImages', e.target.value)
    setUseNsfw(e.target.value)
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
      <div className="mb-2">
        <div className="inline-block w-[220px]">
          Allow NSFW images
          <Tooltip width="200px">
            Workers attempt to block NSFW queries. Images flagged by NSFW filter
            will be blacked out.
          </Tooltip>
        </div>
        <div className="inline-block">
          <Select name="numImages" onChange={handleNsfwSelect} value={useNsfw}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Select>
        </div>
      </div>
      <div className="mb-2">
        <div className="inline-block w-[220px]">
          Worker type
          <Tooltip width="200px">
            Request images from all workers or trusted only. Potential risk if
            untrusted worker is a troll. Trusted is safer, but potentially
            slower.
          </Tooltip>
        </div>
        <div className="inline-block">
          <Select
            name="numImages"
            onChange={handleTrustedSelect}
            value={useTrusted}
          >
            <option value="false">All</option>
            <option value="true">Trusted Only</option>
          </Select>
        </div>
      </div>
      <div className="mb-2">
        <div className="inline-block w-[140px] align-top">User trusted</div>
        <div className="inline-block w-[180px] mr-2">
          {trusted ? 'True' : 'False'}
        </div>
      </div>
      <div className="mb-2">
        <div className="inline-block w-[140px] align-top">
          API key
          <Tooltip width="220px">
            Leave blank for anonymous access. An API key gives higher priority
            access to the Stable Horde distributed cluster, resulting in shorter
            image creation times.
          </Tooltip>
        </div>
        <div className="inline-block">
          <Input
            type="text"
            name="steps"
            onChange={handleApiInput}
            value={apiKey}
            width="220px"
          />
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
        </div>
        <div className="block text-xs mt-2 ml-[140px]">
          ( Leave blank for an anonymous user ID. Register via{' '}
          <a
            href="https://stablehorde.net/"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-500"
          >
            stablehorde.net
          </a>
          . Stored in browser using LocalStorage. )
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
