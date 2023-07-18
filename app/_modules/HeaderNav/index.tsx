/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import HeaderNavLinks from './HeaderNavLinks'
import styles from './headerNav.module.css'
import NoSsr from 'app/_components/NoSsr'
import MenuButton from './MenuButton'

const HeaderNav = () => {
  return (
    <header className={styles.HeaderNav}>
      <MenuButton />
      <div className="flex items-center w-full">
        <Link href="/" className="flex items-center mb-1 gap-2">
          <div>
            <img
              src="/artbot/artbot-logo.png"
              height={30}
              width={30}
              alt="AI ArtBot logo"
              className="min-w-[30px] max-w-[30px]"
            />
          </div>
          <h1 className="ml-2 text-[24px] md:text-[26px] font-bold leading-7 text-teal-500">
            ArtBot
          </h1>
        </Link>
        <NoSsr>
          <HeaderNavLinks />
        </NoSsr>
      </div>
    </header>
  )
}

export default HeaderNav