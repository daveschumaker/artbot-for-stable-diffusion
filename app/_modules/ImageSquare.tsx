/* eslint-disable @next/next/no-img-element */
import clsx from 'clsx'
import { JobImageDetails } from '_types'

interface ImageSquareProps {
  imageDetails: JobImageDetails
  size?: number
  id?: string
  imageType?: string
}

export default function ImageSquare({
  imageDetails,
  size = 180,
  id,
  imageType = 'image/webp'
}: ImageSquareProps) {
  let base64String = `data:${imageType};base64,${
    imageDetails.thumbnail || imageDetails.base64String
  }`

  if (!imageType) {
    base64String = `data:image/webp;base64,${
      imageDetails.thumbnail || imageDetails.base64String
    }`
  }

  const classes = ['overflow-hidden', 'relative']

  return (
    <div
      className={clsx(classes)}
      style={{ width: `${size}px`, height: `${size}px`, position: 'relative' }}
    >
      <img
        // fill
        id={id}
        src={base64String}
        alt={imageDetails?.prompt || ''}
        className="mx-auto rounded"
        style={{ objectFit: 'cover', width: `${size}px`, height: `${size}px` }}
      />
    </div>
  )
}
