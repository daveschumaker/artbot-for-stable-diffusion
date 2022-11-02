import NextImage from 'next/image'
import styled from 'styled-components'

const StyledImage = styled(NextImage)`
  box-shadow: 0 16px 38px -12px rgb(0 0 0 / 56%),
    0 4px 25px 0px rgb(0 0 0 / 12%), 0 8px 10px -5px rgb(0 0 0 / 20%);
`

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
