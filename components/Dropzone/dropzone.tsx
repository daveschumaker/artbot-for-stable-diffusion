import React, { useCallback } from 'react'
import styled from 'styled-components'
import { useDropzone } from 'react-dropzone'

import PlusIcon from '../icons/PlusIcon'
import { getBase64, imageDimensions } from '../../utils/imageUtils'

const imgConfig = {
  quality: 0.9,
  maxWidth: 1024,
  maxHeight: 1024
}

interface UploaderProps {
  children?: React.ReactNode
  handleUpload: any
  type: string
}

const StyledIcon = styled(PlusIcon)`
  display: block;
`

const StyledDropZone = styled.div`
  align-items: center;
  border-color: ${(props) => props.theme.text};
  border-radius: 4px;
  border-style: dashed;
  border-width: 2px;
  color: ${(props) => props.theme.text};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  font-size: 16px;
  height: 200px;
  justify-content: center;
  outline: none;
  padding: 16px;
  text-align: center;
  transition: border 0.24s ease-in-out;
  width: 100%;
`

export default function Dropzone(props: UploaderProps) {
  const { handleUpload, type = 'img2img' } = props

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
        const imageDetails = await imageDimensions(fullDataString)

        // @ts-ignore
        const [fileType, imgBase64String] = fullDataString.split(';base64,')
        const [, imageType] = fileType.split('data:')

        handleUpload({
          imageType,
          source_image: imgBase64String,
          //@ts-ignore
          height: nearestWholeMultiple(imageDetails?.height),
          //@ts-ignore
          width: nearestWholeMultiple(imageDetails?.width)
        })
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
      {fileRejections?.length > 0 && (
        <div className="mb-2 text-red-500 text-lg font-bold">
          Please upload a single valid image file!
        </div>
      )}
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
            <br />({type})
          </div>
        )}
      </StyledDropZone>
    </>
  )
}
