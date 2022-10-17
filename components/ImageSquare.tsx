/* eslint-disable @next/next/no-img-element */

interface ImageDetails {
  base64String: string
  prompt?: string
}

interface ImageSquareProps {
  imageDetails: ImageDetails
  size?: number
  imageType: string
}

export default function ImageSquare({
  imageDetails,
  size = 180,
  imageType = 'image/webp'
}: ImageSquareProps) {
  let base64String = imageDetails.base64String

  console.log(`yo what src?`, base64String)
  console.log(`imgType?`, imageType)

  if (!imageType || imageType === 'image/webp') {
    base64String = `data:image/webp;base64,${imageDetails.base64String}`
  }

  return (
    <img
      src={base64String}
      width={size}
      height={size}
      alt={imageDetails?.prompt}
      className="mx-auto rounded"
      style={{ objectFit: 'cover' }}
    />
  )
}
