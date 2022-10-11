/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { getHasNewImage } from '../utils/imageCache'
import { useRouter } from 'next/router'
import BellIcon from './icons/BellIcon'

export default function Header() {
  const router = useRouter()
  const { pathname } = router
  const [showNewImage, setShowNewImage] = useState(false)

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
    <div className="flex flex-row">
      <div className="mt-2 w-1/2 inline-block">
        <Link href="/">
          <a>
            <div className="inline-block">
              <img
                src="/artbot/artbot-logo.png"
                height={32}
                width={32}
                alt="AI ArtBot logo"
              />
            </div>
            <div className="inline-block">
              <h1 className="ml-2 pt-1 inline-block h-8 text-[30px] font-bold leading-7 text-teal-500">
                ArtBot
              </h1>
            </div>
          </a>
        </Link>
      </div>
      <div className="mt-2 w-1/2 inline-block text-right">
        <div className="mt-3">
          {showNewImage && (
            <Link href="/images" passHref>
              <a onClick={handleForceReload}>
                <BellIcon
                  stroke="#db1a00"
                  size={24}
                  className="inline-block pb-1"
                />
              </a>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
