import { getAllImages } from 'app/_db/image_files'
import { useEffect, useState } from 'react'

export default function useGetImages() {
  const [images, setImages] = useState([])

  const getImages = async () => {
    const data = await getAllImages()
    setImages(data)
  }

  useEffect(() => {
    getImages()
  }, [])

  return [images]
}
