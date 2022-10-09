/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Toast({ handleClose }) {
  const router = useRouter()
  const { pathname } = router

  const handleClick = () => {
    if ('/images' === pathname) {
      window.location.reload(false)
    } else {
      router.push(`/images`)
    }

    handleClose()
  }

  return (
    <>
      <Link href="/images">
        <a onClick={handleClick}>
          <div id="toast-default" className="drop-shadow-md fixed left-[50%] border-[1px] cursor-pointer translate-x-[-50%] mx-auto mt-2 flex items-center p-4 w-[280px] max-w-xs text-gray-500 bg-white rounded-lg shadow bg-cyan-800 z-50" role="alert">
            <div className="inline-flex flex-shrink-0 justify-center items-center w-8 h-8">
              <img src="/artbot/checkmark.svg" alt="Image completed checkmark" />
            </div>
            <div className="flex-col">
              <div className="ml-4 text-sm font-normal text-white">Your new image is ready.</div>
              <div className="ml-4 text-sm font-normal text-cyan-400">Check it out!</div>
            </div>
          </div>
        </a>
      </Link>
    </>
  )
}
