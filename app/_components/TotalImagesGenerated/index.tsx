'use client'

import { useQuery } from '@tanstack/react-query'
import { basePath } from 'BASE_PATH'

const fetchImageCount = async (signal?: AbortSignal) => {
  const res = await fetch(`${basePath}/api/status/counter/images`, { signal })
  if (!res.ok) throw new Error(`Unable to fetch image count: ${res.status}`)
  const data = await res.json()
  return data.totalCount ? Number(data.totalCount) : null
}

export default function TotalImagesGenerated() {
  const { data: totalImages } = useQuery({
    queryKey: ['artbot', 'image-count'],
    queryFn: ({ signal }) => fetchImageCount(signal),
    // A live counter. React Query pauses this while the tab is hidden.
    refetchInterval: 2000
  })

  if (totalImages == null) {
    return null
  }

  return (
    <div className="mb-4 text-lg font-bold">
      Total images generated: {totalImages.toLocaleString()}
    </div>
  )
}
