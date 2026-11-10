declare module 'lz-string'
declare module 'react-responsive-masonry'
declare module '*.md'

declare module 'image-metadata-editor' {
  type ImageInput = Blob | Uint8Array
  export function writePNGtext(
    image: ImageInput,
    key: string,
    value: string,
    mode?: 'tEXt' | 'zTXt'
  ): Promise<Uint8Array>
  export function writeJPGMarker(
    image: ImageInput,
    value: string,
    marker?: number[]
  ): Promise<Uint8Array>
  export function writeXMP(
    image: ImageInput,
    value: string
  ): Promise<Uint8Array>
}
