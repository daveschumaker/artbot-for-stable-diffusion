import type { AppProps } from 'next/app'
import Head from 'next/head'
import Script from 'next/script'
import { ThemeProvider } from 'styled-components'
import withDarkMode from 'next-dark-mode'

import { initAppSettings } from '../utils/appSettings'
import ContentWrapper from '../components/ContentWrapper'
import Footer from '../components/Footer'
import Header from '../components/Header'
import NavBar from '../components/NavBar'
import PollController from '../components/PollController'

import { GlobalStyles } from '../styles/globalStyles'
import { lightTheme, darkTheme } from '../styles/theme'
import '../styles/globals.css'

import { initDb } from '../utils/db'
import { useCallback, useEffect, useState } from 'react'
import { appInfoStore, setBuildId } from '../store/appStore'
import { useStore } from 'statery'
import ServerUpdateModal from '../components/ServerUpdateModal'
import MobileFooter from '../components/MobileFooter'
initAppSettings()
initDb()

let waitingForServerInfoRes = false

interface MyAppProps extends AppProps {
  darkMode: any
}

function MyApp({ Component, darkMode, pageProps }: MyAppProps) {
  const { darkModeActive } = darkMode
  const [showServerUpdateModal, setShowServerUpdateModal] = useState(false)
  const appState = useStore(appInfoStore)
  const { buildId } = appState

  const fetchAppInfo = useCallback(async () => {
    try {
      if (waitingForServerInfoRes) {
        return
      }

      waitingForServerInfoRes = true
      const res = await fetch('/artbot/api/server-info')
      const data = await res.json()
      const { build } = data
      waitingForServerInfoRes = false

      if (!buildId) {
        setBuildId(build)
      } else if (buildId !== build) {
        setShowServerUpdateModal(true)
      }
    } catch (err) {
      console.log(`Unable to fetch latest server-info. Connectivity issue?`)
    }
  }, [buildId])

  useEffect(() => {
    fetchAppInfo()
    const interval = setInterval(async () => {
      fetchAppInfo()
    }, 60000)

    return () => clearInterval(interval)
  }, [fetchAppInfo])

  return (
    <ThemeProvider theme={darkModeActive ? darkTheme : lightTheme}>
      <GlobalStyles />
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
      />

      <Script id="analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
          page_path: window.location.pathname,
          });
      `}
      </Script>
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
        <link rel="manifest" href="/artbot/manifest.json" />
        <meta name="apple-mobile-web-app-title" content="ArtBot"></meta>
        <meta name="mobile-web-app-capable" content="yes"></meta>
        <meta name="apple-mobile-web-app-capable" content="yes"></meta>
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        ></meta>
        <link rel="icon" type="image/x-icon" href="/artbot/favicon.ico"></link>
      </Head>
      <PollController />
      <ContentWrapper>
        {showServerUpdateModal && <ServerUpdateModal />}
        <Header />
        <NavBar />
        <Component {...pageProps} />
        <Footer />
      </ContentWrapper>
      <MobileFooter />
    </ThemeProvider>
  )
}

export default withDarkMode(MyApp)
