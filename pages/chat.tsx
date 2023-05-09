/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import PageTitle from 'components/UI/PageTitle'
import ChatPageComponent from 'modules/ChatPageComponent'
import Head from 'next/head'

const ChatPage = () => {
  return (
    <>
      <Head>
        <title>Chat - ArtBot for Stable Diffusion</title>
        <meta name="twitter:title" content="ArtBot - Live Paint" />
        <meta
          name="twitter:image"
          content="https://tinybots.net/artbot/robots_drawing.png"
        />
      </Head>
      <PageTitle>Chat</PageTitle>
      <ChatPageComponent />
    </>
  )
}

export default ChatPage
