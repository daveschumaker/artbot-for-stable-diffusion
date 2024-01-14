export interface ModelVersion {
  id: number | string
  modelId: number // For linking to parentId page.
  name: string
  baseModel: string
  description: string
  downloadUrl: string
  files: Array<{
    sizeKB: number
  }>
  images: Array<{
    nsfw: boolean
    type: string
    url: string
  }>
  trainedWords: string[]
}

export interface Embedding {
  id: number | string
  description: string
  modelVersions: ModelVersion[]
  name: string
  nsfw: boolean
  tags: string[]
}
