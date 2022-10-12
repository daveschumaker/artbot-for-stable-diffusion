/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useRouter } from 'next/router'

import IconCreate from './icons/CreateIcon'
import HourglassIcon from './icons/HourglassIcon'
import PhotoIcon from './icons/PhotoIcon'
import SettingsIcon from './icons/SettingsIcon'

export default function NavBar() {
  const router = useRouter()
  const { pathname } = router

  const isActiveRoute = (page: string) => {
    if (page === pathname) {
      return 'inline-block p-2 text-teal-500 rounded-t-lg border-b-2 border-teal-500 active0'
    }

    return 'inline-block p-2 rounded-t-lg border-b-2 border-transparent hover:text-teal-500 hover:border-teal-500'
  }

  return (
    <div className="mb-2 text-sm font-medium text-center text-white border-b border-gray-200 w-full">
      <ul className="flex flex-wrap">
        <li className="text-left w-1/4">
          <Link href="/" passHref>
            <a className={isActiveRoute('/')}>
              <IconCreate className="inline-block mr-1 pb-1" />
              Create
            </a>
          </Link>
        </li>
        <li className="text-left w-1/4">
          <Link href="/pending" passHref>
            <a className={isActiveRoute('/pending')}>
              <HourglassIcon className="inline-block mr-[2-px] pb-1" />
              Pending
            </a>
          </Link>
        </li>
        <li className="text-left w-1/4">
          <Link href="/images" passHref>
            <a className={isActiveRoute('/images')}>
              <PhotoIcon className="inline-block mr-[2-px] pb-1" />
              Images
            </a>
          </Link>
        </li>
        <li className="text-left w-1/4">
          <Link href="/settings" passHref>
            <a className={isActiveRoute('/settings')}>
              <SettingsIcon className="inline-block mr-[2-px] pb-1" />
              Settings
            </a>
          </Link>
        </li>
      </ul>
    </div>
  )
}
