/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'

export default function Header() {
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
        <div className="mt-3"></div>
      </div>
    </div>
  )
}
