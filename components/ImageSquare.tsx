import LazyLoad from 'react-lazyload'
import Image from 'next/image'

interface ImageDetails {
  base64String: string
  prompt: string
}

interface ImageSquareProps {
  imageDetails: ImageDetails
}

export default function ImageSquare({ imageDetails }: ImageSquareProps) {
  return (
    <LazyLoad height={128} once className="inline-block">
      <Image
        src={'data:image/webp;base64,' + imageDetails.base64String}
        width={180}
        height={180}
        alt={imageDetails.prompt}
        className="mx-auto"
        objectFit="cover"
      />
    </LazyLoad>
  )
}
