import React, { useState } from 'react'
import styled from 'styled-components'
import { trackEvent } from 'app/_api/telemetry'
import { getBase64 } from 'app/_utils/imageUtils'
import { isValidHttpUrl } from 'app/_utils/validationUtils'
import { Button } from 'app/_components/Button'
import PageTitle from 'app/_components/PageTitle'
import { basePath } from 'BASE_PATH'
import Input from '../Input'
import { UploadButton } from 'app/_modules/UploadButton'

const imgConfig = {
  quality: 0.8,
  maxWidth: 1024,
  maxHeight: 1024
}

interface LabelType {
  type?: string
}

interface UploaderProps {
  children?: React.ReactNode
  handleUpload: any
}

const Label = styled.div<LabelType>`
  color: white;
  font-size: 14px;
  font-weight: 700;
  padding-bottom: 8px;
`

const ErrorLabel = styled(Label)`
  color: red;
  font-weight: 300;
  font-size: 12px;
`

const StyledInput = styled(Input)`
  margin-bottom: 12px;
  width: 100%;
`

const StyledUploader = styled.div`
  margin: 8px 0;
`

const Section = styled.div`
  padding-bottom: 24px;
`

const Uploader = (props: UploaderProps) => {
  const [errorMsg, setErrorMsg] = useState('')
  const [imgUrl, setImgUrl] = useState('')

  const handleFileSelect = async (file: any) => {
    if (typeof window === 'undefined') {
      return
    }

    const { readAndCompressImage } = await import('browser-image-resizer')
    let resizedImage = await readAndCompressImage(file, imgConfig)

    let fullDataString

    if (file) {
      fullDataString = await getBase64(resizedImage)
    }

    if (!fullDataString) {
      return
    }

    // @ts-ignore
    const [fileType, imgBase64String] = fullDataString.split(';base64,')
    const [, imageType] = fileType.split('data:')

    props.handleUpload(imageType, imgBase64String)
  }

  const handleOkClick = async () => {
    const validUrl = isValidHttpUrl(imgUrl)

    if (!validUrl) {
      setErrorMsg(
        'Unable to process image from URL, please try something else.'
      )
      return false
    }

    const resp = await fetch(`${basePath}/api/img-from-url`, {
      method: 'POST',
      body: JSON.stringify({
        imageUrl: imgUrl
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await resp.json()

    // @ts-ignore
    const { success, imageType, imgBase64String } = data

    if (!data || !success) {
      setErrorMsg(
        'Unable to process image from URL, please try something else.'
      )

      trackEvent({
        event: 'ERROR',
        action: 'ERROR_UPLOAD_IMG_BY_URL',
        data: {
          imgUrl
        }
      })

      return false
    }

    trackEvent({
      event: 'UPLOAD_IMG_BY_URL',
      data: {
        imgUrl
      }
    })

    props.handleUpload(imageType, imgBase64String)
  }

  return (
    <StyledUploader>
      <PageTitle>Upload image</PageTitle>
      <Section>
        <Label>From your device:</Label>
        <UploadButton
          // @ts-ignore
          handleFile={handleFileSelect}
          label="Choose file"
        />
      </Section>
      <Section>
        <Label>From a URL:</Label>
        {errorMsg && <ErrorLabel type="error">{errorMsg}</ErrorLabel>}
        <StyledInput
          onChange={(e: any) => setImgUrl(e.target.value)}
          value={imgUrl}
        />
        <Button onClick={handleOkClick}>OK</Button>
      </Section>
    </StyledUploader>
  )
}

export default Uploader
