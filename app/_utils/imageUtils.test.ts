import { inferMimeTypeFromBase64 } from './imageUtils'

describe('inferMimeTypeFromBase64', () => {
  it('should identify jpeg images', () => {
    const jpegBase64 =
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/4QAiRXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAACqADAAQAAAABAAAAAgAAAAADAAAAAQAAAAMAAAABAAAAAAAAAAD/2P/gABBKRklGAAEBAQBRADsA'
    const jpegBase64_v2 =
      '/9j/4AAQSkZJRgABAQEAAAAAAAD/4QAiRXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAACqADAAQAAAABAAAAAgAAAAADAAAAAQAAAAMAAAABAAAAAAAAAAD/2P/gABBKRklGAAEBAQBRADsA'
    expect(inferMimeTypeFromBase64(jpegBase64)).toBe('image/jpeg')
    expect(inferMimeTypeFromBase64(jpegBase64_v2)).toBe('image/jpeg')
  })

  it('should identify png images', () => {
    const pngBase64 =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
    const pngBase64_v2 =
      'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='

    expect(inferMimeTypeFromBase64(pngBase64)).toBe('image/png')
    expect(inferMimeTypeFromBase64(pngBase64_v2)).toBe('image/png')
  })

  it('should identify webp images', () => {
    const webpBase64 =
      'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=='
    const webpBase64_v2 = 'UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=='

    expect(inferMimeTypeFromBase64(webpBase64)).toBe('image/webp')
    expect(inferMimeTypeFromBase64(webpBase64_v2)).toBe('image/webp')
  })

  it('should return unknown for non-image data', () => {
    const unknownBase64 = 'SGVsbG8sIHdvcmxkIQ==' // "Hello, world!"
    expect(inferMimeTypeFromBase64(unknownBase64)).toBe('unknown')
  })
})
