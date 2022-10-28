import React, { useCallback } from 'react'
import styled from 'styled-components'
import { useDropzone } from 'react-dropzone'

import PlusIcon from '../icons/PlusIcon'
import { getBase64 } from '../../utils/imageUtils'

const imgConfig = {
  quality: 0.9,
  maxWidth: 1024,
  maxHeight: 1024
}

interface UploaderProps {
  children?: React.ReactNode
  handleUpload: any
}

const StyledIcon = styled(PlusIcon)`
  display: block;
`

const StyledDropZone = styled.div`
  align-items: center;
  /* background-color: #fafafa; */
  border-color: #eeeeee;
  border-radius: 4px;
  border-style: dashed;
  border-width: 2px;
  color: #bdbdbd;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  font-size: 12px;
  outline: none;
  padding: 2px;
  height: 100px;
  width: 100px;
  justify-content: center;
  text-align: center;
  transition: border 0.24s ease-in-out;

  @media (min-width: 640px) {
    height: 120px;
    width: 120px;
    padding: 8px;
  }
`

export default function Dropzone(props: UploaderProps) {
  const { handleUpload } = props
  const onDrop = useCallback(
    async (acceptedFiles: any[]) => {
      const [acceptedFile] = acceptedFiles
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = async () => {
        const { readAndCompressImage } = await import('browser-image-resizer')
        let resizedImage = await readAndCompressImage(acceptedFile, imgConfig)

        let fullDataString

        if (resizedImage) {
          fullDataString = await getBase64(resizedImage)
        }

        if (!fullDataString) {
          return
        }

        // @ts-ignore
        const [fileType, imgBase64String] = fullDataString.split(';base64,')
        const [, imageType] = fileType.split('data:')

        handleUpload(imageType, imgBase64String)
      }
      try {
        reader.readAsDataURL(acceptedFile)
      } catch (err) {
        console.log(`OOPS!`)
      }
    },
    [handleUpload]
  )

  const {
    fileRejections,
    getRootProps,
    getInputProps,
    isDragActive,
    isFocused,
    isDragAccept,
    isDragReject
  } = useDropzone({ accept: { 'image/*': [] }, maxFiles: 1, onDrop })

  return (
    <>
      {fileRejections?.length > 0 && <div>OOPS!</div>}
      <StyledDropZone
        {...getRootProps({ isFocused, isDragAccept, isDragReject })}
      >
        <input {...getInputProps()} />
        <StyledIcon />
        {isDragActive ? (
          `drop image here`
        ) : (
          <div>
            drag image or click to upload
            <br />
            (img2img)
          </div>
        )}
      </StyledDropZone>
    </>
  )
}
