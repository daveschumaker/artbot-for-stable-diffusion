import React, { useEffect, useState } from 'react'

const SettingsPage = () => {
  const [apiKey, setApiKey] = useState('')
  const [useTrusted, setUseTrusted] = useState('false')

  const handleApiInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem('apikey', e.target.value)
    setApiKey(e.target.value)
  }

  // @ts-ignore
  const handleTrustedSelect = (e) => {
    localStorage.setItem('useTrusted', e.target.value)
    setUseTrusted(e.target.value)
  }

  useEffect(() => {
    if (localStorage.getItem('apikey')) {
      setApiKey(localStorage.getItem('apikey') || '')
    }

    if (localStorage.getItem('useTrusted')) {
      setUseTrusted(localStorage.getItem('useTrusted') || 'false')
    }
  }, [])

  return (
    <div>
      <div className="mb-2">
        <div className="inline-block w-[100px]">API key:</div>
        <div className="inline-block w-[160px]">
          <input
            type="text"
            className="text-black w-full p-1 rounded-lg border border-slate-500"
            name="steps"
            onChange={handleApiInput}
            value={apiKey}
          />
        </div>
        <div className="block w-full text-xs mt-2">
          (An API key gives higher priority access to the Stable Horde
          distributed cluster, resulting in shorter image creation times. Leave
          blank for an anonymous user ID. Register via{' '}
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
      <div className="mb-2">
        <div className="inline-block w-[180px]">Use Trusted Workers:</div>
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
    </div>
  )
}

export default SettingsPage
