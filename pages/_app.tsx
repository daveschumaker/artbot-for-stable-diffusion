import type { AppProps } from 'next/app'
import Head from 'next/head'
import Script from 'next/script'
import { ThemeProvider } from 'styled-components'
import withDarkMode from 'next-dark-mode'

import { initAppSettings } from '../utils/appSettings'
import ContentWrapper from '../components/UI/ContentWrapper'
import Footer from '../components/UI/Footer'
import Header from '../components/UI/Header'
import NavBar from '../components/UI/NavBar'
import PollController from '../components/PollController'

import 'react-toastify/dist/ReactToastify.css'
import { GlobalStyles } from '../styles/globalStyles'
import { lightTheme, darkTheme } from '../styles/theme'
import '../styles/globals.css'

import { initDb } from '../utils/db'
import { useCallback, useEffect, useState } from 'react'
import { appInfoStore, setBuildId, setServerMessage } from '../store/appStore'
import { useStore } from 'statery'
import ServerUpdateModal from '../components/ServerUpdateModal'
import MobileFooter from '../components/MobileFooter'
import { isAppActive } from '../utils/appUtils'
import { ToastContainer } from 'react-toastify'

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
    if (!isAppActive()) {
      return
    }

    try {
      if (waitingForServerInfoRes) {
        return
      }

      waitingForServerInfoRes = true
      const res = await fetch('/artbot/api/server-info')
      const data = await res.json()
      const {
        build,
        message = ''
        // enrollPct = 0,
        // showBetaOption = false
      } = data
      waitingForServerInfoRes = false

      // If user has manually opted in or out of beta
      // then ignore setting A/B test params.
      // const userBetaOption =
      //   localStorage.getItem('useBeta') === 'userTrue' ||
      //   localStorage.getItem('useBeta') === 'userFalse'

      // if (!userBetaOption) {
      //   if (Number(localStorage.getItem('enrollPct')) !== enrollPct) {
      //     localStorage.setItem('enrollPct', enrollPct)

      //     const enrollValue = String(Math.random())
      //     localStorage.setItem('enrollValue', enrollValue)

      //     if (Number(enrollValue) <= enrollPct) {
      //       localStorage.setItem('useBeta', 'true')
      //     }
      //   }

      //   if (!localStorage.getItem('enrollPct') || enrollPct === 0) {
      //     localStorage.removeItem('enrollPct')
      //     localStorage.removeItem('enrollValue')
      //     localStorage.setItem('useBeta', 'false')
      //   }
      // }

      // if (!showBetaOption) {
      //   localStorage.removeItem('enrollPct')
      //   localStorage.removeItem('enrollValue')
      //   localStorage.removeItem('useBeta')
      //   setShowBetaOption(false)
      // } else {
      //   setShowBetaOption(true)
      // }

      setServerMessage(message)

      if (!buildId) {
        setBuildId(build)
      } else if (buildId !== build) {
        setBuildId(build)
        setShowServerUpdateModal(true)
      }
    } catch (err) {
      console.log(`Unable to fetch latest server-info. Connectivity issue?`)
      waitingForServerInfoRes = false
    }
  }, [buildId])

  useEffect(() => {
    fetchAppInfo()
    const interval = setInterval(async () => {
      fetchAppInfo()
    }, 10000)

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
        <title>
          ArtBot - Create images with Stable Diffusion, utilizing the Stable
          Horde
        </title>
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@davely" />
        <meta name="twitter:title" content="ArtBot for Stable Diffusion" />
        <meta
          name="twitter:description"
          content="Generate AI-created images and photos with Stable Diffusion using a distributed computing cluster powered by Stable Horde. No login required and free to use."
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
      <ToastContainer />
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
