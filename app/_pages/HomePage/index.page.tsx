'use client'

import { IconCircleArrowRight } from '@tabler/icons-react'
import FlexRow from 'app/_components/FlexRow'
import PromptTypewriter from 'app/_modules/Typewriter'
import styles from './component.module.css'
import HomePageContentWrapper from 'app/_components/HomePageContentWrapper'

export default function HomePage() {
  return (
    <HomePageContentWrapper>
      <FlexRow style={{ justifyContent: 'center', width: '100%' }}>
        <h1 className={styles.HeroTitle}>
          Welcome to <span style={{ color: `var(--main-color)` }}>ArtBot!</span>
        </h1>
      </FlexRow>
      <div
        style={{
          fontSize: '20px',
          lineHeight: '24px',
          margin: '0 auto 12px auto',
          maxWidth: '980px',
          textAlign: 'center',
          width: '100%'
        }}
      >
        ArtBot is your gateway to experiment with the wonderful world of
        generative AI art using the power of the <strong>AI Horde</strong>, a
        distributed open source network of GPUs running{' '}
        <strong>Stable Diffusion</strong>. <br />
        <br />
        It&apos;s free to use, no registration required.{' '}
        <a
          href="/artbot/create"
          style={{
            alignItems: 'center',
            color: 'var(--main-color)',
            cursor: 'pointer',
            display: 'inline-flex',
            whiteSpace: 'pre'
          }}
        >
          Get started <IconCircleArrowRight size={18} />
        </a>
      </div>
      <div style={{ margin: '24px auto 0 auto', maxWidth: '1400px' }}>
        <PromptTypewriter />
      </div>
    </HomePageContentWrapper>
  )
}
