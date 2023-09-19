/* eslint react/prop-types: 0 */
import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import styles from './component.module.css'

import {
  getBase64,
  imageDimensions,
  nearestWholeMultiple
} from 'app/_utils/imageUtils'
import { IconPlus } from '@tabler/icons-react'

const imgConfig = {
  quality: 0.9,
  maxWidth: 1024,
  maxHeight: 1024
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
