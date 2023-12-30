export enum CreatePageMode {
  EDIT = 'edit',
  LOAD_DRAWING = 'drawing',
  LOAD_MODEL = 'model',
  SHARE = 'share',
  SHORTLINK = 'i',
  PRESET = 'preset',
  PROMPT = 'prompt'
}

const queryParamsToOverrideUserInput: Array<string> = [
  'edit',
  'drawing',
  'model',
  'share',
  'i'
]

const queryParamsSharedLinks: Array<string> = [
  CreatePageMode.SHARE,
  CreatePageMode.SHORTLINK
]

export interface IQuery {
  [key: string]: string | string[] | undefined
}

function isKeyInArray(query: IQuery, arr: string[]): boolean {
  return Object.keys(query).some((key) => arr.includes(key))
}

export const isSharedLink = (query: IQuery = {}) => {
  return isKeyInArray(query, queryParamsSharedLinks) === true
}

export const shouldLoadUserInputCache = (query: IQuery = {}) => {
  return isKeyInArray(query, queryParamsToOverrideUserInput) === false
}
