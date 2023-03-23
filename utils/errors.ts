interface IErrors {
    [key: string]: {text: string, className: string, blocksCreation: boolean}
}

const typeMap = {
    'error': 'text-red-500',
    'warning': 'text-amber-500'
}

const Errors: IErrors = {
    FIXED_SEED: {
        text: 'Warning: You are using a fixed seed with multiple images. (You can still continue)',
        className: typeMap.warning,
        blocksCreation: false
    },
    INPAINT_MISSING_SOURCE_MASK: {
        text: "You've selected inpainting model, but did not provide source image and/or mask. Please upload an image and add paint an area you'd like to change, or change your model to non-inpainting one.",
        className: typeMap.error,
        blocksCreation: true
    },
    PROMPT_EMPTY: {
        text: "Please enter a prompt to continue.",
        className: typeMap.error,
        blocksCreation: false // This is handled by the page itself
    },
    SOURCE_IMAGE_EMPTY: {
        text: "Please upload a source image to continue.",
        className: typeMap.error,
        blocksCreation: false // This is handled by the page itself
    }
}

export default Errors