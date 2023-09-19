import memoize from 'memoizee'
import { fetchRelatedImages } from 'app/_utils/db'

const _relatedImages = async (parentJobId: string) => {
  if (!parentJobId) {
    return []
  }

  const foundImages = await fetchRelatedImages(parentJobId, 100)
  const sortedImages = foundImages.sort((a: any = {}, b: any = {}) => {
    if (a.id < b.id) {
      return 1
    }

    if (a.id > b.id) {
      return -1
    }

    return 0
  })

  return sortedImages
}

export const getRelatedImages = memoize(_relatedImages, { maxAge: 10000 })
