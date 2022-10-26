/* eslint-disable @next/next/no-img-element */
import Image from 'next/image'
import styled from 'styled-components'
interface ImageDetails {
  base64String: string
  prompt?: string
}

interface ImageSquareProps {
  imageDetails: ImageDetails
  size?: number
  imageType?: string
}

interface StyledProps {
  size: number
}

const StyledImageWrapper = styled.div<StyledProps>`
  overflow: hidden;
  position: relative;
  height: ${(props) => props.size}px;
  width: ${(props) => props.size}px;
`

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
    <StyledImageWrapper size={size}>
      <Image
        fill
        src={base64String}
        alt={imageDetails?.prompt || ''}
        className="mx-auto rounded"
        style={{ objectFit: 'cover' }}
      />
    </StyledImageWrapper>
  )
}
