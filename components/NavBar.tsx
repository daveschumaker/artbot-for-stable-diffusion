/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getHasNewImage } from '../utils/imageCache'

export default function NavBar() {
  const router = useRouter()
  const { pathname } = router

  const [showNewImage, setShowNewImage] = useState(false)

  const isActiveRoute = (page: string) => {
    if (page === pathname) {
      return 'inline-block p-2 text-blue-500 rounded-t-lg border-b-2 border-blue-600 active0'
    }

    return 'inline-block p-2 rounded-t-lg border-b-2 border-transparent hover:text-[#1D80A2] hover:border-gray-300'
  }

  const handleForceReload = () => {
    if ('/images' === pathname) {
      window.location.reload()
    }
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      const hasNewImage = getHasNewImage()
      setShowNewImage(hasNewImage)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mb-2 text-sm font-medium text-center text-white border-b border-gray-200 w-full">
      <ul className="flex flex-wrap">
        <li className="text-left w-1/4">
          <Link href="/" passHref>
            <a className={isActiveRoute('/')}>
              <img
                src="/artbot/create-icon.svg"
                className="inline-block mb-1 mr-2"
                height={16}
                width={16}
                alt="Create new image"
              />
              Create
            </a>
          </Link>
        </li>
        <li className="text-left w-1/4">
          <Link href="/pending" passHref>
            <a className={isActiveRoute('/pending')}>
              <img
                src="/artbot/pending-icon.svg"
                className="inline-block mb-1 mr-2"
                height={14}
                width={14}
                alt="Pending images"
              />
              Pending
            </a>
          </Link>
        </li>
        <li className="text-left w-1/4">
          <Link href="/images" passHref>
            <a className={isActiveRoute('/images')} onClick={handleForceReload}>
              <img
                src={
                  showNewImage
                    ? '/artbot/new-icon.svg'
                    : '/artbot/images-icon.svg'
                }
                className="inline-block mb-1 mr-2"
                height={showNewImage ? 16 : 14}
                width={showNewImage ? 16 : 14}
                alt="Your images"
              />
              Images
            </a>
          </Link>
        </li>
        <li className="text-left w-1/4">
          <Link href="/settings" passHref>
            <a className={isActiveRoute('/settings')}>
              <img
                src="/artbot/settings-icon.svg"
                className="inline-block mb-1 mr-2"
                height={14}
                width={14}
                alt="Settings"
              />
              Settings
            </a>
          </Link>
        </li>
      </ul>
    </div>
  )
}
