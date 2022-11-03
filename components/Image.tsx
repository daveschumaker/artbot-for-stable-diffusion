/* eslint-disable @next/next/no-img-element */
import styled from 'styled-components'

interface ImageProps {
  alt: string
  imageType: string
  base64String: string
  height: number
  width: number
}

interface StyledProps {
  height: number
  width: number
}

const ImageWrapper = styled.div<StyledProps>`
  overflow: hidden;
  position: relative;
  height: ${(props) => props.height};
  width: ${(props) => props.width};
`

const Image = ({
  alt = '',
  imageType = 'image/webp',
  base64String = '',
  height = 0,
  width = 0
}: ImageProps) => {
  if (!base64String || !height || !width) {
    return null
  }

  return (
    <ImageWrapper height={height} width={width}>
      <img src={`data:${imageType};base64,${base64String}`} alt={alt} />
    </ImageWrapper>
  )
}

export default Image
