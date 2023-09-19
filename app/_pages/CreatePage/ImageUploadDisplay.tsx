import { IconX } from '@tabler/icons-react'
import Dropzone from 'app/_modules/Dropzone'
import ImageSquare from 'app/_modules/ImageSquare'
import styled from 'styled-components'

interface Props {
  handleUpload(imageType: string, source_image: string): void
  imageType?: string
  sourceImage?: string
  resetImage(): void
}

const StyledWrapper = styled.div`
  flex-shrink: 0;
  height: 120px;
  position: relative;
  width: 120px;
`

const ImageUploadDisplay = ({
  handleUpload,
  imageType,
  resetImage,
  sourceImage
}: Props) => {
  return (
    <StyledWrapper>
      {sourceImage && (
        <ImageSquare
          imageDetails={{ base64String: sourceImage }}
          imageType={imageType}
          size={120}
        />
      )}
      {sourceImage && (
        <div
          className="absolute top-[0px] right-[0px] bg-blue-500 cursor-pointer"
          onClick={resetImage}
        >
          <IconX />
        </div>
      )}
      {!sourceImage && <Dropzone handleUpload={handleUpload} type="img2img" />}
    </StyledWrapper>
  )
}

export default ImageUploadDisplay
