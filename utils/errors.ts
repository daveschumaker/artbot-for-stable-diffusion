interface IErrors {
    [key: string]: {text: string, className: string}
}

const typeMap = {
    'error': 'text-red-500',
    'warning': 'text-amber-500'
}

const Errors: IErrors = {
    FIXED_SEED: {
        text: 'Warning: You are using a fixed seed with multiple images. (You can still continue)',
        className: typeMap.warning
    }
}

export default Errors