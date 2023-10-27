/* eslint react/prop-types: 0 */
import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import styles from './component.module.css'

import {
  cropToNearest64,
  getBase64,
  nearestWholeMultiple
} from 'app/_utils/imageUtils'
import { IconPlus } from '@tabler/icons-react'

const imgConfig = {
  quality: 0.95,
  maxWidth: 3072,
  maxHeight: 3072
}

interface UploaderProps {
  children?: React.ReactNode
  handleUpload: any
  type?: string
}

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
        const [fileType, imgBase64String] = fullDataString.split(';base64,')
        const [, imageType] = fileType.split('data:')

        try {
          const {
            croppedBase64,
            newWidth: croppedWidth,
            newHeight: croppedHeight
          }: any = await cropToNearest64(imgBase64String)

          handleUpload({
            imageType,
            source_image: croppedBase64,
            //@ts-ignore
            height: nearestWholeMultiple(croppedHeight),
            //@ts-ignore
            width: nearestWholeMultiple(croppedWidth)
          })
        } catch (error) {
          console.error('Error cropping the image:', error)
        }
      }

      try {
        reader.readAsDataURL(acceptedFile)
      } catch (err) {
        console.log(`OOPS!`)
      }
    },
    [handleUpload]
  )

  const { fileRejections, getRootProps, getInputProps, isDragActive } =
    useDropzone({ accept: { 'image/*': [] }, maxFiles: 1, onDrop })

  return (
    <>
      {fileRejections?.length > 0 && (
        <div className="mb-2 text-red-500 text-lg font-bold">
          Please upload a single valid image file!
        </div>
      )}
      <div className={styles.Dropzone} {...getRootProps()}>
        <input {...getInputProps()} />
        <IconPlus style={{ display: 'block' }} />
        {isDragActive ? (
          `drop image here`
        ) : (
          <div>
            drag image or click to upload
            <br />({type})
          </div>
        )}
      </div>
    </>
  )
}
