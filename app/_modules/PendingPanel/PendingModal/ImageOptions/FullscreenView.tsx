/* eslint-disable @next/next/no-img-element */
import { Dispatch } from 'react'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'

export default function FullscreenView({
  imageSrc,
  fullscreen,
  setFullscreen
}: {
  imageSrc: Blob
  fullscreen: boolean
  setFullscreen: Dispatch<boolean>
}) {
  const showFullScreen = useFullScreenHandle()

  if (!fullscreen) return null

  return (
    <FullScreen
      handle={showFullScreen}
      onChange={(isFullscreen) => setFullscreen(isFullscreen)}
    >
      <div
        className="flex flex-row items-center justify-center w-full h-screen"
        onClick={() => {
          showFullScreen.exit()
        }}
      >
        <img
          className="max-h-screen max-w-full"
          src={URL.createObjectURL(imageSrc)}
          alt="Fullscreen image"
          style={{
            borderRadius: '4px',
            boxShadow: `0 16px 38px -12px rgb(0 0 0 / 56%), 0 4px 25px 0px rgb(0 0 0 / 12%), 0 8px 6px -5px rgb(0 0 0 / 20%)`,
            maxHeight: `100%`
          }}
        />
      </div>
    </FullScreen>
  )
}
