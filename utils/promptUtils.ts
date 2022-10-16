interface SavePrompt {
  img2img: boolean
  copyPrompt: boolean
  prompt: string
  parentJobId: string
  negative?: string
  base64String?: string
}

let promptDetails: SavePrompt = {
  img2img: false,
  copyPrompt: false,
  prompt: '',
  parentJobId: '',
  negative: '',
  base64String: ''
}

// TODO: Restore other parameters relate to image
// e.g., height, width, sampler, etc.
export const savePrompt = ({
  img2img = false,
  prompt = '',
  parentJobId = '',
  negative = '',
  base64String = ''
} = {}) => {
  promptDetails = {
    img2img,
    copyPrompt: true,
    prompt,
    parentJobId,
    negative,
    base64String
  }
}

export const loadEditPrompt = () => {
  return Object.assign({}, promptDetails)
}

export const clearPrompt = () => {
  promptDetails = {
    img2img: false,
    copyPrompt: false,
    prompt: '',
    parentJobId: '',
    negative: '',
    base64String: ''
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
