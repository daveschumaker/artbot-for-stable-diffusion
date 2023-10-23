'use client'
import Link from 'next/link'
import styles from './footer.module.css'
import Linker from '../Linker'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

export default function FooterV2() {
  const pathname = usePathname()

  const isHomePage = pathname === '/'

  return (
    <div className={clsx(styles.Footer, isHomePage && styles.NoPadding)}>
      <div className={styles.SectionsWrapper}>
        <div className={styles.Section}>
          <div className={styles.SectionTitle}>Creation Tools</div>
          <div>
            <Link href="/create">Create new image</Link>
          </div>
          <div>
            <Link href="/controlnet">ControlNet</Link>
          </div>
          <div>
            <Link href="/draw">Draw</Link>
          </div>
          <div>
            <Link href="/create?panel=img2img">Image-to-image</Link>
          </div>
          <div>
            <Link href="/create?panel=inpainting">Inpainting</Link>
          </div>
          <div>
            <Link href="/live-paint">Live paint</Link>
          </div>
        </div>
        <div className={styles.Section}>
          <div className={styles.SectionTitle}>Image gallery</div>
          <div>
            <Link href="/pending">Pending image requests</Link>
          </div>
          <div>
            <Link href="/images">View image gallery</Link>
          </div>
        </div>
        <div className={styles.Section}>
          <div className={styles.SectionTitle}>General info</div>
          <div>
            <Link href="/info/models">Model details</Link>
          </div>
          <div>
            <Link href="/info/models/updates">Model updates</Link>
          </div>
          <div>
            <Link href="/info/workers">Worker details</Link>
          </div>
        </div>
        <div className={styles.Section}>
          <div className={styles.SectionTitle}>Utilities</div>
          <div>
            <Link href="/settings?panel=import-export">Export images</Link>
          </div>
          <div>
            <Link href="/interrogate">Interrogate image</Link>
          </div>
          <div>
            <Link href="/settings?panel=worker">Manage workers</Link>
          </div>
          <div>
            <Link href="/rate">Rate images</Link>
          </div>
          <div>
            <Link href="/profile">User profile</Link>
          </div>
        </div>
        <div className={styles.Section}>
          <div className={styles.SectionTitle}>Community</div>
          <div>
            <Link href="/showcase">Image showcase</Link>
          </div>
        </div>
        <div className={styles.Section}>
          <div className={styles.SectionTitle}>Contact</div>
          <div>
            <Link href="https://discord.com/channels/781145214752129095/1107628882783391744">
              Discord
            </Link>
          </div>
          <div>
            <Link href="https://github.com/daveschumaker/artbot-for-stable-diffusion/issues">
              Github issues
            </Link>
          </div>
          <div>
            <Link href="https://mastodon.world/@davely">Mastodon</Link>
          </div>
          <div>
            <Link href="/contact">Send message</Link>
          </div>
        </div>
        <div className={styles.Section}>
          <div className={styles.SectionTitle}>ArtBot</div>
          <div>
            <Link href="/about">About</Link>
          </div>
          <div>
            <Link href="/changelog">Changelog</Link>
          </div>
          <div>
            <Link href="/contributors">Contributors</Link>
          </div>
          <div>
            <Link href="/faq">FAQ</Link>
          </div>
          <div>
            <Link href="https://github.com/daveschumaker/artbot-for-stable-diffusion">
              Github
            </Link>
          </div>
          <div>
            <Link href="'/settings?panel=prefs">Preferences</Link>
          </div>
          <div>
            <Link href="/privacy">Privacy policy</Link>
          </div>
          <div>
            <Link href="'/settings">Settings</Link>
          </div>
        </div>
      </div>
      <div className={styles.AboutWrapper}>
        <div>
          ArtBot is created with ❤️ , ☕️ and ☀️ by{' '}
          <Linker
            href="https://mastodon.world/@davely"
            target="_blank"
            rel="noopener noreferrer"
          >
            @davely
          </Linker>{' '}
          in California.
        </div>
      </div>
    </div>
  )
}
