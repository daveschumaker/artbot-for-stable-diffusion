'use client'

import { IconAlertTriangle, IconBellRinging } from '@tabler/icons-react'
import { basePath } from 'BASE_PATH'
import { Button } from 'app/_components/Button'
import FlexCol from 'app/_components/FlexCol'
import FlexRow from 'app/_components/FlexRow'
import Input from 'app/_components/Input'
import PageTitle from 'app/_components/PageTitle'
import Section from 'app/_components/Section'
import Select from 'app/_components/Select'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import TextArea from 'app/_components/TextArea'
import AppSettings from 'app/_data-models/AppSettings'
import {
  clearAuthToken,
  setAuthToken,
  userInfoStore
} from 'app/_store/userStore'
import React, { useCallback, useEffect, useState } from 'react'
import { useStore } from 'statery'

export default function AdminPage() {
  const { jwt, role } = useStore(userInfoStore)

  const [loggedIn, setLoggedIn] = useState(false)
  const [hasError, setHasError] = useState('')

  const [serverTitle, setServerTitle] = useState('')
  const [serverMessage, setServerMessage] = useState('')

  const [newsTitle, setNewsTitle] = useState('')
  const [newsContent, setNewsContent] = useState('')
  const [newsTimestamp, setNewsTimestamp] = useState('')

  const [userInput, setUserInput] = useState('')
  const [pwInput, setPwInput] = useState('')

  const handleLoadServerSettings = async () => {
    try {
      const response = await fetch(`${basePath}/api/admin/load-settings`)
      const data = (await response.json()) || {}
      const { serverSettings = {} } = data

      // Alert panel settings
      const { message = {} } = serverSettings
      setServerTitle(message.title || '')
      setServerMessage(message.content || '')

      // Notification panel settings
      const { notification = {} } = serverSettings
      setNewsTitle(notification.title || '')
      setNewsContent(notification.content || '')
      setNewsTimestamp(notification.timestamp || '')
    } catch (err) {}
  }

  const handleUpdateServerSettings = useCallback(async () => {
    const serverSettings = {
      message: {
        title: serverTitle,
        content: serverMessage,
        timestamp: Date.now()
      },
      notification: {
        title: newsTitle,
        content: newsContent,
        timestamp: Date.now()
      }
    }

    try {
      await fetch(`${basePath}/api/admin/update-settings`, {
        method: 'POST',
        body: JSON.stringify(serverSettings),
        headers: {
          Authorization: jwt as string
        }
      })
    } catch (err) {}
  }, [serverTitle, serverMessage, newsTitle, newsContent, jwt])

  const handleLoginClick = useCallback(async () => {
    const response = await fetch(`${basePath}/api/admin/login`, {
      method: 'POST',
      body: JSON.stringify({ username: userInput, password: pwInput })
    })
    const { success, token } = await response.json()

    if (success) {
      setLoggedIn(true)
      setAuthToken(token)
      setHasError('')
      AppSettings.set('user_token', token)
    } else {
      setHasError('Oh, no. Something unfortunate has happened.')
    }
  }, [pwInput, userInput])

  useEffect(() => {
    if (jwt && role === 'admin') {
      setLoggedIn(true)
    } else {
      setLoggedIn(false)
    }
  }, [jwt, role])

  useEffect(() => {
    if (loggedIn) {
      handleLoadServerSettings()
    }
  }, [loggedIn])

  if (!loggedIn) {
    return (
      <FlexRow style={{ paddingTop: '24px', justifyContent: 'center' }}>
        <FlexCol gap={8} style={{ maxWidth: '512px' }}>
          <FlexRow gap={8}>
            <div style={{ width: '100px' }}>Username:</div>
            <Input
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUserInput(e.target.value)
              }
              value={userInput}
            />
          </FlexRow>
          <FlexRow gap={8}>
            <div style={{ width: '100px' }}>Password:</div>
            <Input
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPwInput(e.target.value)
              }
              type="password"
              value={pwInput}
            />
          </FlexRow>
          {hasError && (
            <div style={{ color: 'red', padding: '8px 0' }}>{hasError}</div>
          )}
          <Button onClick={handleLoginClick}>Submit</Button>
        </FlexCol>
      </FlexRow>
    )
  }

  return (
    <div>
      <PageTitle>Admin Dashboard</PageTitle>
      <Section
        style={{
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '8px',
          marginBottom: '8px'
        }}
      >
        <SubSectionTitle style={{ display: 'flex', gap: '8px' }}>
          <IconAlertTriangle stroke={1.5} /> Server Message
        </SubSectionTitle>
        <FlexRow gap={8} pb={8}>
          Preset:
          <Select
            onChange={(obj: { value: any; label: string }) => {
              setServerTitle(obj.value.title)
              setServerMessage(obj.value.content)
            }}
            options={[
              {
                label: '(Clear)',
                value: {
                  title: '',
                  content: ``
                }
              },
              {
                label: 'ArtBot update',
                value: {
                  title: 'ArtBot will be updated',
                  content: `The ArtBot server will be undergoing an update in about 5 minutes. Please save your work. <br/><br/>\n\n<a href="https://discord.com/channels/781145214752129095/1107628882783391744" target="_blank" style="color: #17cfbb;cursor:pointer;font-weight:700;">Visit the ArtBot channel on Discord for the latest.<a/>`
                }
              },
              {
                label: 'Horde unavailable',
                value: {
                  title: 'AI Horde is currently unavailable',
                  content: `ArtBot is currently having trouble connecting to the AI Horde. Image requests may fail. Stay tuned for further updates.<br/><br/>\n\n<a href="https://discord.com/channels/781145214752129095/1020695869927981086" target="_blank" style="color: #17cfbb;cursor:pointer;font-weight:700;">Visit Discord for more information.<a/>`
                }
              }
            ]}
          />
        </FlexRow>
        <Input
          placeholder="Server message title"
          onChange={(e: any) => setServerTitle(e.target.value)}
          value={serverTitle}
          style={{ marginBottom: '8px' }}
        />
        <TextArea
          placeholder="Additional server details"
          onChange={(e: any) => setServerMessage(e.target.value)}
          value={serverMessage}
        />
        <FlexRow gap={4} style={{ justifyContent: 'flex-end' }}>
          <Button
            theme="secondary"
            onClick={() => {
              setServerTitle('')
              setServerMessage('')
            }}
          >
            Clear
          </Button>
          <Button onClick={handleUpdateServerSettings}>Save</Button>
        </FlexRow>
      </Section>
      <Section
        style={{
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '8px',
          marginBottom: '8px'
        }}
      >
        <SubSectionTitle style={{ display: 'flex', gap: '8px' }}>
          <IconBellRinging stroke={1.5} /> Notification update
        </SubSectionTitle>
        <Input
          placeholder="Notification title"
          onChange={(e: any) => setNewsTitle(e.target.value)}
          value={newsTitle}
          style={{ marginBottom: '8px' }}
        />
        <TextArea
          placeholder="Additional notification details"
          onChange={(e: any) => setNewsContent(e.target.value)}
          value={newsContent}
        />
        {newsTimestamp && (
          <FlexRow gap={4} style={{ fontSize: '14px' }}>
            Posted: {new Date(newsTimestamp).toLocaleString()}
          </FlexRow>
        )}
        <FlexRow gap={4} style={{ justifyContent: 'flex-end' }}>
          <Button
            theme="secondary"
            onClick={() => {
              setNewsTitle('')
              setNewsContent('')
            }}
          >
            Clear
          </Button>
          <Button onClick={handleUpdateServerSettings}>Save</Button>
        </FlexRow>
      </Section>
      <Section>
        <Button
          theme="secondary"
          onClick={() => {
            AppSettings.set('user_token', '')
            clearAuthToken()
          }}
        >
          Log out
        </Button>
      </Section>
    </div>
  )
}
