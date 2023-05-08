import React, { useState } from 'react'
import styled from 'styled-components'
import { getImageFromUrl } from '../../utils/imageUtils'
import Dropzone from '../Dropzone/dropzone'
import { Button } from '../UI/Button'
import FlexRow from '../UI/FlexRow'
import Input from '../UI/Input'

const SubSectionTitle = styled.div`
  padding-bottom: 8px;
`

interface Props {
  handleSaveImage: any
  type?: string
}

const Uploader = ({ handleSaveImage, type = 'img2img' }: Props) => {
  const [imgUrl, setImgUrl] = useState('')
  const [imgUrlError, setImgUrlError] = useState('')

  const handleImportFromUrl = async () => {
    if (!imgUrl) {
      return
    }

    const data = await getImageFromUrl(imgUrl)
    const { success, message, imageType, imgBase64String, height, width } = data

    if (!success) {
      setImgUrlError(message || '')
      return
    }

    setImgUrlError('')
    handleSaveImage({ imageType, source_image: imgBase64String, height, width })
  }

  return (
    <div>
      <SubSectionTitle>
        Upload an image from your device or import from URL
      </SubSectionTitle>
      <FlexRow paddingBottom="8px">
        <span style={{ lineHeight: '40px', marginRight: '16px' }}>URL:</span>
        <Input
          className="mb-2"
          type="text"
          name="img-url"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setImgUrl(e.target.value)
          }
          value={imgUrl}
          width="100%"
        />
        <Button
          title="Upload image from URL"
          theme="primary"
          onClick={handleImportFromUrl}
          width="120px"
        >
          Upload
        </Button>
      </FlexRow>
      {imgUrlError && (
        <div className="mb-2 text-red-500 text-lg font-bold">{imgUrlError}</div>
      )}
      <Dropzone handleUpload={handleSaveImage} type={type} />
    </div>
  )
}

export default Uploader
