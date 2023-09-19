let cache = {
  base64String: ''
}

export const setImageForInterrogation = (imageDetails: any) => {
  cache.base64String = imageDetails.base64String
}

export const getImageForInterrogation = () => {
  return cache.base64String
}
