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
          '2xl:max-w-[1280px]'
        )}
      >
        <div
          className={clsx([
            'cursor-pointer',
            'mr-[12px]',
            'mt-[4px]',
            `hover:text-[rgb(20,184,166)]`
          ])}
          onClick={() => setShowAppMenu(true)}
        >
          <MenuIcon size={28} />
        </div>
        <div className="w-full flex items-center">
          <Link href="/" className="mb-1 flex items-center">
            <div>
              <Image
                src="/artbot/artbot-logo.png"
                height={30}
                width={30}
                alt="AI ArtBot logo"
                className="min-w-[30px] max-w-[30px]"
              />
            </div>
            <div>
              <h1 className="ml-2 pt-2 mb-1 md:mb-[2px] h-8 text-[24px] md:text-[26px] font-bold leading-7 text-teal-500">
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
