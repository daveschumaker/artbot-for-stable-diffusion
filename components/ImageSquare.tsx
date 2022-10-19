/* eslint-disable @next/next/no-img-element */
import Image from 'next/image'
// import styled from 'styled-components'
interface ImageDetails {
  base64String: string
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
  let base64String = `data:${imageType};base64,${imageDetails.base64String}`

  if (!imageType) {
    base64String = `data:image/webp;base64,${imageDetails.base64String}`
  }

  return (
    <Image
      src={base64String}
      width={size}
      height={size}
      alt={imageDetails?.prompt}
      className="mx-auto rounded"
      objectFit="cover"
    />
  )
}
