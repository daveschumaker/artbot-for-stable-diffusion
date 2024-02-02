import { db } from './dexie'

interface FavoriteImage {
  jobId: string
  imageId: string
}

export const deleteFavoriteFromDexie = async (imageId: string) => {
  await db.favorites.where('imageId').equals(imageId).delete()
}

export const getFavoriteFromDexie = async (imageId: string) => {
  return await db.favorites.where('imageId').equals(imageId).toArray()
}

export const toggleFavorite = async (image: FavoriteImage) => {
  try {
    const [hasFav] = await getFavoriteFromDexie(image.imageId)

    if (hasFav) {
      await deleteFavoriteFromDexie(image.imageId)
      return
    }

    await db.favorites.add({
      ...image
    })
  } catch (err) {
    console.log(`Error: Unable to favorite image`)
    console.log(err)
  }
}
