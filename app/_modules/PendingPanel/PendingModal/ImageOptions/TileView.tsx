/* eslint-disable @next/next/no-img-element */
import NiceModal from '@ebay/nice-modal-react'
import { ImageSrc } from '_types/artbot'
import { useEffect, useState } from 'react'

const tileSizes = ['64px', '128px', '256px', '512px', '768px', '1024px']

function TileView({
  handleClose = () => {},
  imageSrc,
  tileSize = '128px'
}: {
  handleClose: () => void
  imageSrc: ImageSrc
  tileSize?: string
}) {
  const [tileIndex, setTileIndex] = useState(tileSizes.indexOf(tileSize))

  useEffect(() => {
    // @ts-ignore
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        handleClose()
      }

      if (e.key === 'ArrowUp') {
        if (tileIndex < tileSizes.length - 1) {
          setTileIndex(tileIndex + 1)
        }
      }

      if (e.key === 'ArrowDown') {
        if (tileIndex > 0) {
          setTileIndex(tileIndex - 1)
        }
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleClose, tileIndex])

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
        id="fullscreen-tile-view"
        className="flex flex-row items-center justify-center w-full h-screen"
      >
        <div
          className="z-[102] fixed top-0 left-0 right-0 bottom-0 bg-repeat"
          style={{
            backgroundImage: `url("${imageSrc.url}")`,
            backgroundSize: tileSizes[tileIndex]
          }}
        ></div>
      </div>
    </div>
  )
}

export default NiceModal.create(TileView)
