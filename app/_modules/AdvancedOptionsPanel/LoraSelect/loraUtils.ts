import { SavedLora } from '_types/artbot'
import { Embedding, ModelVersion } from '_types/civitai'
import { sanitize } from 'isomorphic-dompurify'

interface CivitAiSearchParams {
  input?: string
  page?: number
  nsfw?: boolean
  sdxl?: boolean
  sd15?: boolean
  sd21?: boolean
  illu?: boolean
  noob?: boolean
  flux?: boolean
  pony?: boolean
}

export const buildCivitaiQuery = ({
  input,
  page = 1,
  nsfw = false,
  sdxl = false,
  sd15 = false,
  sd21 = false,
  illu = false,
  noob = false,
  flux = false,
  pony = false
}: CivitAiSearchParams): string => {
  let baseModelFilter = ''

  // Build base model filter based on user preferences
  if (sd15) {
    baseModelFilter += ['1.4', '1.5', '1.5 LCM']
      .map((e) => '&baseModels=SD ' + e)
      .join('')
  }

  if (sd21) {
    baseModelFilter += ['2.0', '2.0 768', '2.1', '2.1 768', '2.1 Unclip']
      .map((e) => '&baseModels=SD ' + e)
      .join('')
  }

  if (sdxl) {
    baseModelFilter += ['0.9', '1.0', '1.0 LCM', 'Turbo']
      .map((e) => '&baseModels=SDXL ' + e)
      .join('')
  }

  if (pony) {
    baseModelFilter += '&baseModels=Pony'
  }

  if (flux) {
    baseModelFilter += ['Flux.1 S', 'Flux.1 D']
      .map((e) => '&baseModels=' + e)
      .join('')
  }

  if (noob) {
    baseModelFilter += '&baseModels=NoobAI'
  }

  if (illu) {
    baseModelFilter += '&baseModels=Illustrious'
  }

  // URL encode spaces
  baseModelFilter = baseModelFilter.replace(/ /g, '%20')

  const query = input ? `&query=${input}` : ''
  // Don't include page parameter when there's a query search
  const paginationParam = input ? '' : `&page=${page}`
  const searchKey = `limit=20${query}${paginationParam}&nsfw=${nsfw}${baseModelFilter}`

  return searchKey
}

export const buildCivitaiCacheKey = (params: CivitAiSearchParams): string => {
  // Create a unique cache key that includes all filter states
  const filterState =
    [
      params.nsfw ? 'nsfw' : '',
      params.sdxl ? 'sdxl' : '',
      params.sd15 ? 'sd15' : '',
      params.sd21 ? 'sd21' : '',
      params.illu ? 'illu' : '',
      params.noob ? 'noob' : '',
      params.flux ? 'flux' : '',
      params.pony ? 'pony' : ''
    ]
      .filter(Boolean)
      .join('-') || 'no-filters'

  return buildCivitaiQuery(params) + `&filters=${filterState}`
}

export const handleConvertLora = (
  lora: Embedding,
  version: ModelVersion
): SavedLora => {
  const { files = [], images = [] } = version

  return {
    baseModelId: lora.id as number,
    parentModelId: version.modelId,
    name: version.id,
    label: lora.name,
    versionLabel: version.name,
    versionId: version.id as number,
    description: sanitize(version.description || lora.description || ''),
    baseModel: version.baseModel,
    trainedWords: version.trainedWords,
    image:
      images[0] && images[0].type === 'image' && images[0].url
        ? images[0].url
        : '',
    sizeKb: files[0].sizeKB,
    model: 1,
    clip: 1,
    is_version: version.modelId && version.id !== version.modelId ? true : false
  }
}
