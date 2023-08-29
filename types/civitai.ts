export interface ModelVersion {
  baseModel: string
  downloadUrl: string
  images: Array<{
    url: string
    nsfw: boolean
  }>
}

export interface Embedding {
  id: number
  description: string
  modelVersions: ModelVersion[]
  name: string
  nsfw: boolean
  tags: string[]
}
