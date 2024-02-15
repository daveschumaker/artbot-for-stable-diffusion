/* eslint-disable @next/next/no-img-element */
import NiceModal from '@ebay/nice-modal-react'
import { ImageSrc } from '_types/artbot'
import { useEffect } from 'react'

function FullscreenView({
  handleClose = () => {},
  imageSrc
}: {
  handleClose: () => void
  imageSrc: ImageSrc
}) {
  useEffect(() => {
    // @ts-ignore
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        backgroundColor: 'black'
      }}
    >
      <div
        id="fullscreen-img"
        className="flex flex-row items-center justify-center w-full h-screen"
      >
        <img
          className="max-h-screen max-w-full"
          src={imageSrc.url}
          alt="Fullscreen image"
          style={{
            borderRadius: '4px',
            boxShadow: `0 16px 38px -12px rgb(0 0 0 / 56%), 0 4px 25px 0px rgb(0 0 0 / 12%), 0 8px 6px -5px rgb(0 0 0 / 20%)`,
            maxHeight: `100%`
          }}
        />
      </div>
    </div>
  )
}

export default NiceModal.create(FullscreenView)
