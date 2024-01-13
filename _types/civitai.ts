export interface ModelVersion {
  id: number | string
  name: string
  baseModel: string
  downloadUrl: string
  images: Array<{
    url: string
    nsfw: boolean
  }>
}

export interface Embedding {
  id: number | string
  description: string
  modelVersions: ModelVersion[]
  name: string
  nsfw: boolean
  tags: string[]
}
