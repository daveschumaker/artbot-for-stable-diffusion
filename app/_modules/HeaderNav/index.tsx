/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import HeaderNavLinks from './HeaderNavLinks'
import styles from './headerNav.module.css'
import NoSsr from 'app/_components/NoSsr'
import MenuButton from './MenuButton'
import { basePath } from 'BASE_PATH'

const HeaderNav = () => {
  return (
    <header className={styles.HeaderNav}>
      <MenuButton />
      <div className={styles.HeaderNavWrapper}>
        <Link href="/" className={styles.HeaderNavWrapper}>
          <div>
            <img
              src={`${basePath}/artbot-logo.png`}
              height={30}
              width={30}
              alt="AI ArtBot logo"
              className="min-w-[30px] max-w-[30px]"
            />
          </div>
          <h1 className={styles.Title}>ArtBot</h1>
        </Link>
        <NoSsr>
          <HeaderNavLinks />
        </NoSsr>
      </div>
    </header>
  )
}

export default HeaderNav
