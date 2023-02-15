import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { setShowAppMenu } from '../../../store/appStore'
import MenuIcon from '../../icons/MenuIcon'
import NavBar from './navBar'

const Header = () => {
  return (
    <header
      className={clsx([
        'flex',
        'flex-row',
        'pt-safe',
        'w-full',
        'items-center',
        'fixed',
        'top-[0]',
        'left-[0]',
        'right-[0]',
        'z-[25]',
        'bg-[#f2f2f2]',
        'dark:bg-[#222222]'
      ])}
    >
      <div
        className={clsx(
          'mx-auto',
          'w-[calc(100%-16px)]',
          'flex',
          'flex-row',
          'py-[8px]',
          'sm:max-w-[768px]',
          'xl:max-w-[1024px]',
          '2xl:max-w-[1280px]',
          '4xl:max-w-[1536px]'
        )}
      >
        <div
          className={clsx([
            'cursor-pointer',
            'mr-[8px]',
            `hover:text-[rgb(20,184,166)]`
          ])}
          onClick={() => setShowAppMenu(true)}
        >
          <MenuIcon size={28} />
        </div>
        <div className="w-full flex flex-row items-center">
          <Link href="/">
            <div className="inline-block">
              <Image
                src="/artbot/artbot-logo.png"
                height={30}
                width={30}
                alt="AI ArtBot logo"
              />
            </div>
            <div className="inline-block">
              <h1 className="ml-2 pt-1 inline-block h-8 text-[24px] md:text-[28px] font-bold leading-7 text-teal-500">
                ArtBot
              </h1>
            </div>
          </Link>
          <NavBar />
        </div>
      </div>
    </header>
  )
}

export default Header
