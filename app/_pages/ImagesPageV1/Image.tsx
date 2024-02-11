/* eslint-disable @next/next/no-img-element */
import React, { CSSProperties, useCallback, useEffect, useState } from 'react'

import placeholderImage from '../../../public/placeholder.gif'
import { base64toBlobUrl } from 'app/_utils/imageUtils'

function Image({
  alt,
  id,
  imageJob,
  style
}: {
  alt: string
  id?: string
  imageJob: any
  style?: CSSProperties
}) {
  const [imageSrc, setImageSrc] = useState<string | undefined>()

  const loadImage = useCallback(async () => {
    if (imageJob.thumbnail || imageJob.base64String) {
      const img = await base64toBlobUrl(
        imageJob.thumbnail || imageJob.base64String
      )
      if (img) {
        setImageSrc(img)
      }
    }
  }, [imageJob.base64String, imageJob.thumbnail])

  useEffect(() => {
    const hasImage = imageJob.base64String || imageJob.thumbnail
    if (!imageSrc && hasImage) {
      loadImage()
    }

    // Clean up Blob URL when the component unmounts
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc)
    }
  }, [imageJob.base64String, imageJob.thumbnail, imageSrc, loadImage])

  return (
    <img
      alt={alt}
      src={imageSrc || placeholderImage.src}
      id={id}
      height={imageJob.height}
      width={imageJob.width}
      style={{ borderRadius: '4px', ...style }}
    />
  )
}

export default React.memo(Image)
