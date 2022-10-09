interface SavePrompt {
  copyPrompt: boolean
  prompt: string
}

let promptDetails: SavePrompt = {
  copyPrompt: false,
  prompt: ''
}

// TODO: Restore other parameters relate to image
// e.g., height, width, sampler, etc.
export const savePrompt = ({ prompt = '' } = {}) => {
  promptDetails = {
    copyPrompt: true,
    prompt
  }
}

export const loadEditPrompt = () => {
  return Object.assign({}, promptDetails)
}

export const clearPrompt = () => {
  promptDetails = {
    copyPrompt: false,
    prompt: ''
  }
}
