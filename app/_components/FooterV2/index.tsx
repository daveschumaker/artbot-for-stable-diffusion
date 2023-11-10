/* eslint-disable @next/next/no-img-element */
'use client'
import Link from 'next/link'
import styles from './footer.module.css'
import Linker from '../Linker'
import {
  IconBuildingCommunity,
  IconCamera,
  IconExternalLink,
  IconInfoCircle,
  IconMessage,
  IconPhoto,
  IconQuestionMark,
  IconRobot,
  IconTool
} from '@tabler/icons-react'
import FlexRow from '../FlexRow'
import { basePath } from 'BASE_PATH'

export default function FooterV2() {
  return (
    <>
      <footer className="footer grid-rows-2 p-10 bg-base-200 text-base-content">
        <nav>
          <header className="footer-title flex flex-row items-center gap-2">
            <IconCamera stroke={1} />
            Creation Tools
          </header>
          <div>
            <Link className={styles.LinkWrapper} href="/create">
              Create new image
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/controlnet">
              ControlNet
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/draw">
              Draw
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/create?panel=img2img">
              Image-to-image
            </Link>
          </div>
          <div>
            <Link
              className={styles.LinkWrapper}
              href="/create?panel=inpainting"
            >
              Inpainting
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/live-paint">
              Live paint
            </Link>
          </div>
        </nav>
        <nav>
          <header className="footer-title flex flex-row items-center gap-2">
            <IconPhoto stroke={1} />
            Image gallery
          </header>
          <div>
            <Link className={styles.LinkWrapper} href="/pending">
              Pending images
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/images">
              View image gallery
            </Link>
          </div>
        </nav>
        <nav>
          <header className="footer-title flex flex-row items-center gap-2">
            <IconInfoCircle stroke={1} />
            General info
          </header>
          <div>
            <Link className={styles.LinkWrapper} href="/info/models">
              Model details
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/info/models/updates">
              Model updates
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/info/workers">
              Worker details
            </Link>
          </div>
        </nav>
        <nav>
          <header className="footer-title flex flex-row items-center gap-2">
            <IconTool stroke={1} />
            Utilities
          </header>
          <div>
            <Link
              className={styles.LinkWrapper}
              href="/settings?panel=import-export"
            >
              Export images
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/interrogate">
              Interrogate image
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/settings?panel=worker">
              Manage workers
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/rate">
              Rate images
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/profile">
              User profile
            </Link>
          </div>
        </nav>
        <nav>
          <header className="footer-title flex flex-row items-center gap-2">
            <IconBuildingCommunity stroke={1} />
            Community
          </header>
          <Link
            href="https://aihorde.net"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FlexRow gap={2}>
              AI Horde <IconExternalLink size={18} stroke={1} />
            </FlexRow>
          </Link>
          <div>
            <Link className={styles.LinkWrapper} href="/showcase">
              Image showcase
            </Link>
          </div>
        </nav>
        <nav>
          <header className="footer-title flex flex-row items-center gap-2">
            <IconQuestionMark stroke={1} />
            Resources
          </header>
          <div>
            <Link className={styles.LinkWrapper} href="/faq">
              FAQ
            </Link>
          </div>
        </nav>
        <nav>
          <header className="footer-title flex flex-row items-center gap-2">
            <IconMessage stroke={1} />
            Contact
          </header>
          <div>
            <Link
              href="https://discord.com/channels/781145214752129095/1107628882783391744"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FlexRow gap={2}>
                Discord
                <IconExternalLink size={18} stroke={1} />
              </FlexRow>
            </Link>
          </div>
          <div>
            <Link
              href="https://github.com/daveschumaker/artbot-for-stable-diffusion/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FlexRow gap={2}>
                Github issues <IconExternalLink size={18} stroke={1} />
              </FlexRow>
            </Link>
          </div>
          <div>
            <Link
              href="https://mastodon.world/@davely"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FlexRow gap={2}>
                Mastodon <IconExternalLink size={18} stroke={1} />
              </FlexRow>
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/contact">
              Send message
            </Link>
          </div>
        </nav>
        <nav>
          <header className="footer-title flex flex-row items-center gap-2">
            <IconRobot stroke={1} />
            ArtBot
          </header>
          <div>
            <Link className={styles.LinkWrapper} href="/about">
              About
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/changelog">
              Changelog
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/contributors">
              Contributors
            </Link>
          </div>
          <div>
            <Link
              href="https://github.com/daveschumaker/artbot-for-stable-diffusion"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FlexRow gap={2}>
                Github
                <IconExternalLink size={18} stroke={1} />
              </FlexRow>
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/settings?panel=prefs">
              Preferences
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/privacy">
              Privacy policy
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/settings">
              Settings
            </Link>
          </div>
        </nav>
      </footer>
      <footer className="footer px-10 py-4 border-t bg-base-200 text-base-content border-base-300">
        <aside className="flex flex-row items-center gap-4">
          <img
            src={`${basePath}/artbot-logo.png`}
            alt="AI ArtBot logo"
            className="max-w-[40px]"
          />
          <p>
            ArtBot is created with ❤️ , ☕️ and ☀️ by{' '}
            <Linker
              href="https://mastodon.world/@davely"
              target="_blank"
              rel="noopener noreferrer"
            >
              @davely
            </Linker>{' '}
            in California.
          </p>
        </aside>
      </footer>
    </>
  )
}
