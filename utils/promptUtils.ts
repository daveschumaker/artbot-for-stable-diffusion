interface SavePrompt {
  copyPrompt: boolean
  prompt: string
  parentJobId: string
}

let promptDetails: SavePrompt = {
  copyPrompt: false,
  prompt: '',
  parentJobId: ''
}

// TODO: Restore other parameters relate to image
// e.g., height, width, sampler, etc.
export const savePrompt = ({ prompt = '', parentJobId = '' } = {}) => {
  promptDetails = {
    copyPrompt: true,
    prompt,
    parentJobId
  }
}

export const loadEditPrompt = () => {
  return Object.assign({}, promptDetails)
}

export const clearPrompt = () => {
  promptDetails = {
    copyPrompt: false,
    prompt: '',
    parentJobId: ''
  }
}

// Caches prompt so that it can be restored when user switches between tabs
let cachedPrompt = ''

export const updatedCachedPrompt = (text: string) => {
  cachedPrompt = text
}

export const getCachedPrompt = () => {
  return cachedPrompt
}
