'use client'

import { useEffect, useState } from 'react'
import { basePath } from 'BASE_PATH'

export default function TotalImagesGenerated() {
  const [totalImages, setTotalImages] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchImageCount = async () => {
    try {
      const res = await fetch(`${basePath}/api/status/counter/images`)
      const data = await res.json()
      if (data.totalCount) {
        setTotalImages(Number(data.totalCount))
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Failed to fetch image count:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchImageCount()

    // Poll every 2 seconds
    const interval = setInterval(() => {
      fetchImageCount()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading || totalImages === null) {
    return null
  }

  return (
    <div className="mb-4 text-lg font-bold">
      Total images generated: {totalImages.toLocaleString()}
    </div>
  )
}
