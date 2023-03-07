/* eslint-disable @next/next/no-img-element */
import clsx from 'clsx'
import Image from 'next/image'

interface ImageDetails {
  base64String: string
  thumbnail?: string
  prompt?: string
}

interface ImageSquareProps {
  imageDetails: ImageDetails
  size?: number
  imageType?: string
}

export default function ImageSquare({
  imageDetails,
  size = 180,
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
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <Image
        fill
        src={base64String}
        alt={imageDetails?.prompt || ''}
        className="mx-auto rounded"
        style={{ objectFit: 'cover' }}
      />
    </div>
  )
}
