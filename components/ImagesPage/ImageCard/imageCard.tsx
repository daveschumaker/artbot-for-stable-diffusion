import Image from 'next/image'
import Link from 'next/link'
import styled from 'styled-components'

import ImageCardDetails from './ImageCardDetails'

interface Props {
  imageDetails: ImageDetails
  handleDeleteImageClick(): void
}

interface ImageDetails {
  jobId: string
  base64String: string
  prompt: string
  timestamp: number
  seed: number
}

const CardContainer = styled.div`
  border: 1px solid ${(props) => props.theme.inputText};
  border-radius: 4px;
  margin: 0 auto;
  max-width: 512px;
  width: 100%;
`

const StyledImageContainer = styled.div`
  position: relative;
  height: ${(props) => props.height};
  width: ${(props) => props.width};
  /* max-height: 768px; */
  max-width: 512px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
`

const ImageCard = (props: Props) => {
  const { imageDetails, handleDeleteImageClick } = props
  const { jobId, height, width, base64String, prompt } = imageDetails
  return (
    <CardContainer>
      <Link href={`/image/${jobId}`} passHref>
        <StyledImageContainer height={height} width={width}>
          <Image
            src={'data:image/webp;base64,' + base64String}
            className="mx-auto rounded-t-lg"
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
