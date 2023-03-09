let imagesForModalCache: Array<any> = []

export const setImagesForModalCache = (images: Array<any> = []) => {
  imagesForModalCache = [...images]
}

export const getImagesForModalCache = () => {
  return imagesForModalCache
}

export const clearImagesForModalCache = () => {
  imagesForModalCache = []
}
