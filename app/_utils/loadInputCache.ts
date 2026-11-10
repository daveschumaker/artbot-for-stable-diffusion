export enum CreatePageMode {
  EDIT = 'edit',
  LOAD_DRAWING = 'drawing',
  LOAD_MODEL = 'model',
  PRESET = 'preset',
  PROMPT = 'prompt'
}

const queryParamsToOverrideUserInput: Array<string> = [
  'edit',
  'drawing',
  'model'
]

export interface IQuery {
  [key: string]: string | string[] | undefined
}

function isKeyInArray(query: IQuery, arr: string[]): boolean {
  return Object.keys(query).some((key) => arr.includes(key))
}

export const shouldLoadUserInputCache = (query: IQuery = {}) => {
  return isKeyInArray(query, queryParamsToOverrideUserInput) === false
}
