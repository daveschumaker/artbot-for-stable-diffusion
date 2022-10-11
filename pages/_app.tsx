import type { AppProps } from 'next/app'
import Head from 'next/head'

import { initAppSettings } from '../utils/appSettings'
import ContentWrapper from '../components/ContentWrapper'
import Footer from '../components/Footer'
import Header from '../components/Header'
import NavBar from '../components/NavBar'
import PollController from '../components/PollController'
import '../styles/globals.css'

import { initDb } from '../utils/db'
initAppSettings()
initDb()

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>ArtBot - A Stable Diffusion demo utilizing Stable Horde</title>
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
        <link rel="icon" type="image/x-icon" href="/artbot/favicon.ico"></link>
      </Head>
      <PollController />
      <ContentWrapper>
        <Header />
        <NavBar />
        <Component {...pageProps} />
        <Footer />
      </ContentWrapper>
    </>
  )
}

export default MyApp
