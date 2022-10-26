import Image from 'next/image'
import Link from 'next/link'
import styled from 'styled-components'

import ImageCardDetails from './ImageCardDetails'

interface Props {
  imageDetails: ImageDetails
  handleDeleteImageClick(): void
}

interface ImageDetails {
  base64String: string
  height: number
  jobId: string
  prompt: string
  seed: number
  timestamp: number
  width: number
}

interface StyledProps {
  height: number
  width: number
}

const CardContainer = styled.div`
  border: 2px solid ${(props) => props.theme.text};
  border-radius: 4px;
  margin: 0 auto;
  margin-bottom: 8px;
  max-width: 512px;
  width: 100%;
`

const StyledImageContainer = styled.div<StyledProps>`
  position: relative;
`

const StyledImage = styled(Image)``

const ImageCard = (props: Props) => {
  const { imageDetails, handleDeleteImageClick } = props
  const { jobId, height, width, base64String, prompt } = imageDetails
  return (
    <CardContainer>
      <Link href={`/image/${jobId}`} passHref>
        <StyledImageContainer height={height} width={width}>
          <StyledImage
            src={'data:image/webp;base64,' + base64String}
            alt={prompt}
            height={height}
            width={width}
          />
        </StyledImageContainer>
      </Link>
      <ImageCardDetails
        imageDetails={imageDetails}
        onDelete={handleDeleteImageClick}
      />
    </CardContainer>
  )
}

export default ImageCard
