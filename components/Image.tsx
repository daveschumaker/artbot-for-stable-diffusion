/* eslint-disable @next/next/no-img-element */
import clsx from 'clsx'

interface ImageProps {
  alt: string
  imageType: string
  base64String: string
  height: number
  width: number
}

const Image = ({
  alt = '',
  imageType = 'image/webp',
  base64String = '',
  height = 0,
  width = 0
}: ImageProps) => {
  if (!base64String || !height || !width) {
    return null
  }

  const classes = ['overflow-hidden', 'relative']

  return (
    <div
      className={clsx(classes)}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <img src={`data:${imageType};base64,${base64String}`} alt={alt} />
    </div>
  )
}

export default Image
