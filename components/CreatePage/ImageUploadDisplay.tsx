import styled from 'styled-components'
import Dropzone from '../Dropzone/dropzone'
import CloseIcon from '../icons/CloseIcon'
import ImageSquare from '../ImageSquare'

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
          <CloseIcon />
        </div>
      )}
      {!sourceImage && <Dropzone handleUpload={handleUpload} />}
    </StyledWrapper>
  )
}

export default ImageUploadDisplay
