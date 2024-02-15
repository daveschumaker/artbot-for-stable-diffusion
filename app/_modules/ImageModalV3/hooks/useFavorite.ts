import { getFavoriteFromDexie, toggleFavorite } from 'app/_db/favorites'
import { useCallback, useEffect, useState } from 'react'

type UseFavoriteReturnType = [boolean, () => Promise<void>]

export default function useFavorite({
  imageId,
  jobId
}: {
  imageId: string
  jobId: string
}): UseFavoriteReturnType {
  const [favorited, setFavorited] = useState<boolean>(false)

  const getFavorite = useCallback(async () => {
    if (!imageId) return

    const [hasFav] = await getFavoriteFromDexie(imageId)

    if (hasFav) {
      setFavorited(true)
    } else {
      setFavorited(false)
    }
  }, [imageId])

  const onFavoriteClick = useCallback(async () => {
    console.log(`uh.. imageId?`, imageId)
    if (!imageId) return

    const updateFavorited = !favorited
    setFavorited(updateFavorited)

    await toggleFavorite({
      jobId,
      imageId
    })
  }, [favorited, imageId, jobId])

  useEffect(() => {
    getFavorite()
  }, [getFavorite, imageId])

  return [favorited, onFavoriteClick]
}
