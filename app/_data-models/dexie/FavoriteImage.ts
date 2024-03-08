class FavoriteImage {
  // Indexed fields
  jobId: string = ''
  imageId: string = ''

  constructor(params: Partial<FavoriteImage>) {
    Object.assign(this, params)
  }
}

export { FavoriteImage }
