import Head from 'next/head'
import PageTitle from '../components/UI/PageTitle'
import Linker from '../components/UI/Linker'
import FeedbackForm from '../components/FeedbackForm'
import React, { useState } from 'react'
import { useEffectOnce } from '../hooks/useEffectOnce'
import { trackEvent } from '../api/telemetry'
import Panel from '../components/UI/Panel'
import AdContainer from '../components/AdContainer'
import Section from '../components/UI/Section'
import SubSectionTitle from '../components/UI/SubSectionTitle'
import styles from '../styles/changelog.module.css'
import Modal from '../components/Modal'
import { useWindowSize } from 'hooks/useWindowSize'
import { appInfoStore } from 'store/appStore'
import { useStore } from 'statery'

import ReactMarkdown from 'react-markdown'
import CHANGELOG from '../CHANGELOG.md'
import clsx from 'clsx'

export const StyledUl = ({
  children,
  depth
}: {
  children: React.ReactNode
  depth?: number
}) => {
  return (
    <ul
      className={clsx(styles['styled-ul'], {
        [styles['styled-ul-depth-1']]: depth === 1
      })}
    >
      {children}
    </ul>
  )
}

export const StyledLi = ({ children }: { children: React.ReactNode }) => {
  return <li className={styles['styled-li']}>{children}</li>
}

export const AddedInfo = ({ children }: { children: React.ReactNode }) => {
  return <div className={styles['more-info']}>{children}</div>
}

const ModifiedLinker = (props: any) => {
  const elementProps = { ...props }

  const isInternalUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url)
      return (
        parsedUrl.hostname === 'localhost' ||
        parsedUrl.hostname === 'tinybots.net'
      )
    } catch (err) {
      return true
    }
  }

  if (!isInternalUrl(props.href)) {
    elementProps.target = '_blank'
    elementProps.rel = 'noopener noreferrer'
  }

  return <Linker {...elementProps} />
}

const LinkButton = ({
  children,
  onClick = () => {}
}: {
  children: React.ReactNode
  onClick: () => void
}) => {
  return (
    <div className={styles['link-btn']} onClick={onClick}>
      {children}
    </div>
  )
}

/** TEMPLATE

<Section>
  <SubSectionTitle>2023.05.01</SubSectionTitle>
  <StyledUl>
    <StyledLi>test</StyledLi>
  </StyledUl>
</Section>

<AddedInfo> exists for further explanation
*/

const Changelog = () => {
  const size = useWindowSize()
  const appState = useStore(appInfoStore)
  const { imageDetailsModalOpen } = appState

  const [showFeedback, setShowFeedback] = useState(false)

  useEffectOnce(() => {
    trackEvent({
      event: 'PAGE_VIEW',
      context: '/pages/changelog'
    })
  })

  return (
    <div className="mb-4">
      {showFeedback && (
        <Modal handleClose={() => setShowFeedback(false)}>
          <FeedbackForm />
        </Modal>
      )}
      <Head>
        <title>Changelog - ArtBot for Stable Diffusion</title>
        <meta name="twitter:title" content="ArtBot - Changelog" />
      </Head>
      <PageTitle>Changelog</PageTitle>
      <div className="mb-4">
        The latest happenings on ArtBot. Have a feature request or bug report?{' '}
        <LinkButton onClick={() => setShowFeedback(true)}>
          Contact me!
        </LinkButton>
      </div>
      {!imageDetailsModalOpen &&
        //@ts-ignore
        size.width < 890 && (
          <div className="w-full">
            <AdContainer />
          </div>
        )}
      <Panel>
        <SubSectionTitle>Ongoing issues:</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            2022.12.24 - Bulk downloads using the export option are a bit buggy.
            I believe this is due to browser and device memory limitations.
            I&apos;m investigating ways to make the downloads easier (perhaps
            breaking them up into a series of files that you would have to
            manually download). In the meantime, you can optionally download 100
            images at a time on from the{' '}
            <Linker href="/images">images page</Linker> or groups of your
            favorite images. (I know that some of you have thousands of images
            and this is not ideal at the moment.)
          </StyledLi>
        </StyledUl>
      </Panel>
      <div className="px-1">
        <Section>
          <ReactMarkdown
            components={{
              a: ({ ...props }) => <ModifiedLinker {...props} />,
              code: ({ ...props }) => <code className="text-sm" {...props} />,
              h1: ({ ...props }) => (
                <h2 className="pb-[8px] font-[700]" {...props} />
              ),
              li: ({ ...props }) => {
                return <StyledLi {...props} />
              },
              ul: ({ ...props }) => {
                return <StyledUl {...props} />
              }
            }}
          >
            {CHANGELOG}
          </ReactMarkdown>
        </Section>
      </div>
    </div>
  )
}

export default Changelog
