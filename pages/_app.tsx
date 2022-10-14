import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ThemeProvider } from 'styled-components'

import { initAppSettings } from '../utils/appSettings'
import ContentWrapper from '../components/ContentWrapper'
import Footer from '../components/Footer'
import Header from '../components/Header'
import NavBar from '../components/NavBar'
import PollController from '../components/PollController'
import '../styles/globals.css'

import { initDb } from '../utils/db'
import { useCallback, useEffect } from 'react'
import { appInfoStore, setBuildId } from '../store/appStore'
import { useStore } from 'statery'
initAppSettings()
initDb()

function MyApp({ Component, pageProps }: AppProps) {
  const appState = useStore(appInfoStore)
  const { buildId } = appState

  const fetchAppInfo = useCallback(async () => {
    try {
      const res = await fetch('/artbot/api/server-info')
      const data = await res.json()
      const { build } = data

      if (!buildId) {
        setBuildId(build)
      } else if (buildId !== build) {
        // console.log(`buildId mistatch - reload page!`)
        // console.log(`client id:`, buildId)
        // console.log(`server id:`, build)
      }
    } catch (err) {
      console.log(`Unable to fetch latest server-info. Connectivity issue?`)
    }
  }, [buildId])

  const theme = {}

  useEffect(() => {
    fetchAppInfo()
    const interval = setInterval(async () => {
      fetchAppInfo()
    }, 60000)

    return () => clearInterval(interval)
  }, [fetchAppInfo])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').then(
          function (registration) {
            console.log(
              'Service Worker registration successful with scope: ',
              registration.scope
            )
          },
          function (err) {
            console.log('Service Worker registration failed: ', err)
          }
        )
      })
    }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>ArtBot - A Stable Diffusion demo utilizing Stable Horde</title>
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@davely" />
        <meta name="twitter:title" content="ArtBot for Stable Diffusion" />
        <meta
          name="twitter:description"
          content="Generate AI-created images and photos with Stable Diffusion using a distributed computing cluster powered by Stable Horde."
        />
        <meta
          name="twitter:image"
          content="https://tinybots.net/artbot/painting_bot.png"
        />
        <link
          rel="apple-touch-icon"
          href="/artbot/apple-touch-icon-iphone-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/artbot/apple-touch-icon-ipad-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/artbot/apple-touch-icon-iphone-retina-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/artbot/apple-touch-icon-ipad-retina-152x152.png"
        />
        <meta name="apple-mobile-web-app-title" content="ArtBot"></meta>
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        ></meta>
        <link rel="icon" type="image/x-icon" href="/artbot/favicon.ico"></link>
      </Head>
      <PollController />
      <ContentWrapper>
        <Header />
        <NavBar />
        <Component {...pageProps} />
        <Footer />
      </ContentWrapper>
    </ThemeProvider>
  )
}

export default MyApp
