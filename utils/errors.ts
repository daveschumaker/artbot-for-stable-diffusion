interface IErrors {
    [key: string]: string
}

const Errors: IErrors = {
    FIXED_SEED: 'Warning: You are using a fixed seed with multiple images. (You can still continue)'
}

export default Errors