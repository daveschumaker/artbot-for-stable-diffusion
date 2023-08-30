/* eslint-disable @next/next/no-img-element */
import clsx from 'clsx'
import { CSSProperties } from 'react'

interface ImageProps {
  alt: string
  imageType: string
  base64String: string
  height: number
  width: number
  unsetDivDimensions?: boolean
}

const Image = ({
  alt = '',
  imageType = 'image/webp',
  base64String = '',
  height = 0,
  width = 0,
  unsetDivDimensions = false
}: ImageProps) => {
  if (!base64String || !height || !width) {
    return null
  }

  const classes = ['overflow-hidden', 'relative']

  const style: CSSProperties = {}

  if (!unsetDivDimensions) {
    if (height) style.height = `${height}px`
    if (width) style.width = `${width}px`
  }

  return (
    <div className={clsx(classes)} style={{ ...style }}>
      <img src={`data:${imageType};base64,${base64String}`} alt={alt} />
    </div>
  )
}

export default Image
