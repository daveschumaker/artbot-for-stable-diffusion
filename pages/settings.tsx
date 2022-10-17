import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import { useStore } from 'statery'
import { fetchUserDetails } from '../api/userInfo'
import { Button } from '../components/Button'
import PageTitle from '../components/PageTitle'
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
        <div className="inline-block w-[220px]">Allow NSFW images:</div>
        <div className="inline-block w-[100px]">
          <select
            className="text-black w-full p-1 rounded-lg border border-slate-500"
            name="numImages"
            onChange={handleNsfwSelect}
            value={useNsfw}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
      <div className="mb-2">
        <div className="inline-block w-[220px]">Use Only Trusted Workers:</div>
        <div className="inline-block w-[100px]">
          <select
            className="text-black w-full p-1 rounded-lg border border-slate-500"
            name="numImages"
            onChange={handleTrustedSelect}
            value={useTrusted}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
      <div className="mb-2">
        <div className="inline-block w-[140px] align-top">User trusted:</div>
        <div className="inline-block w-[180px] mr-2">
          {trusted ? 'True' : 'False'}
        </div>
      </div>
      <div className="mb-2">
        <div className="inline-block w-[140px] align-top">API key:</div>
        <div className="inline-block w-[180px] mr-2">
          <input
            type="text"
            className="text-black w-full p-1 rounded-lg border border-slate-500"
            name="steps"
            onChange={handleApiInput}
            value={apiKey}
          />
          <div className="flex gap-2 mt-2 justify-end">
            <Button
              onClick={() => {
                handleSaveApiKey()
              }}
            >
              Save
            </Button>
            <Button
              onClick={() => {
                setTrustedUser(false)
                setApiKey('')
                localStorage.setItem('apikey', '')
              }}
            >
              Clear
            </Button>
          </div>
        </div>
        <div className="block w-full text-xs mt-2">
          (Leave blank for anonymous access. An API key gives higher priority
          access to the Stable Horde distributed cluster, resulting in shorter
          image creation times. Leave blank for an anonymous user ID. Register
          via{' '}
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
