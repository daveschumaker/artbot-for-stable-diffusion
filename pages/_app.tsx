import { ErrorBoundary } from 'react-error-boundary'
import { useCallback, useEffect, useState } from 'react'
import { useStore } from 'statery'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Script from 'next/script'
import { ThemeProvider } from 'styled-components'
import withDarkMode from 'next-dark-mode'

import { initAppSettings } from '../utils/appSettings'
import ContentWrapper from '../components/UI/ContentWrapper'
import Footer from '../components/UI/Footer'
import Header from '../components/UI/Header'
import PollController from '../components/PollController'

import 'react-toastify/dist/ReactToastify.css'
import { lightTheme, darkTheme } from '../styles/theme'
import '../styles/globals.css'
import '../styles/root.css'

import { initDb } from '../utils/db'
import { appInfoStore, setBuildId, setClusterSettings } from '../store/appStore'
import ServerUpdateModal from '../components/ServerUpdateModal'
import MobileFooter from '../components/MobileFooter'
import { isAppActive } from '../utils/appUtils'
import { ToastContainer } from 'react-toastify'
import AdContainer from '../components/AdContainer'
import { useRouter } from 'next/router'
import { useWindowSize } from '../hooks/useWindowSize'
import Menu from '../components/Menu'
import Linker from '../components/UI/Linker'
import ServerMessage from '../components/ServerMessage'
import { initPendingJobService } from 'controllers/pendingJobsController'
import ErrorComponent, { logErrorInComponent } from 'components/ErrorComponent'

initAppSettings()
initDb()
initPendingJobService()

let waitingForServerInfoRes = false

interface MyAppProps extends AppProps {
  darkMode: any
}

function MyApp({ Component, darkMode, pageProps }: MyAppProps) {
  const router = useRouter()
  const { darkModeActive } = darkMode
  const [showServerUpdateModal, setShowServerUpdateModal] = useState(false)
  const size = useWindowSize()

  const appState = useStore(appInfoStore)
  const { buildId, stableHordeApiOnline, showAppMenu, unsupportedBrowser } =
    appState

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
      const { build, clusterSettings } = data
      waitingForServerInfoRes = false

      if (clusterSettings) {
        setClusterSettings(clusterSettings)
      }

      if (!buildId) {
        setBuildId(build)
      } else if (buildId !== build) {
        setBuildId(build)

        if (appInfoStore.state.clusterSettings.forceReloadOnServerUpdate) {
          setShowServerUpdateModal(true)
        } else {
          console.log(
            'Application was just updated in the background. Reload this page for the latest code.'
          )
        }
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

  let sizeOverride = false
  if (typeof size.width !== 'undefined') {
    if (size?.width > 1130 && size?.width < 1279) {
      sizeOverride = true
    } else if (size?.width > 1388 && size?.width < 1440) {
      sizeOverride = true
    } else if (size?.width > 1639) {
      sizeOverride = true
    } else {
      sizeOverride = false
    }
  }

  return (
    <ThemeProvider theme={darkModeActive ? darkTheme : lightTheme}>
      {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ? (
        <>
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
        </>
      ) : null}
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
        <meta
          name="viewport"
          content="initial-scale=1, viewport-fit=cover, width=device-width"
        ></meta>
        <meta name="apple-mobile-web-app-capable" content="yes"></meta>
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        ></meta>
        <meta
          name="theme-color"
          content="#f3f3ef"
          media="(prefers-color-scheme: light)"
        ></meta>
        <meta
          name="theme-color"
          content="#080B0C"
          media="(prefers-color-scheme: dark)"
        ></meta>
        <link rel="icon" type="image/x-icon" href="/artbot/favicon.ico"></link>
      </Head>
      <PollController />
      <ContentWrapper>
        <Menu show={showAppMenu} />
        <Header />
        <div className="absolute mx-auto w-full pb-[88px] md:pb-[0] top-[56px] md:top-[44px] md:relative">
          <ToastContainer
            style={{ marginTop: `calc(env(safe-area-inset-top))` }}
          />
          {showServerUpdateModal && <ServerUpdateModal />}
          <ServerMessage />
          {/* <NavBar /> */}
          {unsupportedBrowser && (
            <div className="text-sm border-2 border-rose-600 py-1 px-2 rounded mb-2 text-red-500">
              <div className="mb-[8px]">
                <strong>WARNING:</strong> The current state of this web browser
                does not support the IndexedDb browser API.
              </div>
              <div className="mb-[8px]">
                Due to this, ArtBot will not work. (This commonly happens when
                using Firefox&apos;s private browsing mode.) Please try using a
                different browser or exit private mode in Firefox.
              </div>
            </div>
          )}
          {!stableHordeApiOnline && (
            <div className="text-sm border-2 border-rose-600 py-1 px-2 rounded mb-2 text-red-500">
              <strong>Warning:</strong> ArtBot is currently unable to connect to
              the Stable Horde API backend as it is currently unavailable.
              Please try again soon or{' '}
              <Linker
                href="https://discord.gg/3DxrhksKzn"
                target="_blank"
                rel="noreferrer"
              >
                check Discord
              </Linker>{' '}
              for more information.
            </div>
          )}
          {/* <div
            id="global-server-message"
            className="text-sm border-2 border-rose-600 py-1 px-2 rounded mb-2 text-red-500"
          >
            <strong>WARNING!</strong> The Stable Horde API is currently
            experiencing *significant* delays due to backend issues. Requests
            may take a long time to complete or fail. Please try again soon or{' '}
            <Linker
              href="https://discord.gg/3DxrhksKzn"
              target="_blank"
              rel="noreferrer"
            >
              check Discord
            </Linker>{' '}
            for more information.
            <div className="mt-2 text-sm text-[black] dark:text-[white]">
              Updated: 5:23 AM Thursday, February 23, 2023 UTC
            </div>
          </div> */}
          <ErrorBoundary
            FallbackComponent={ErrorComponent}
            onError={logErrorInComponent}
          >
            <Component {...pageProps} />
          </ErrorBoundary>
          <Footer />
          {sizeOverride && (
            <div className="fixed right-[16px] bottom-[8px] max-w-[156px]">
              <AdContainer
                code="CWYD62QI"
                placement="tinybotsnet"
                key={router.asPath}
                minSize={1440}
                override={sizeOverride}
              />
            </div>
          )}
        </div>
      </ContentWrapper>
      <MobileFooter />
    </ThemeProvider>
  )
}

export default withDarkMode(MyApp)
