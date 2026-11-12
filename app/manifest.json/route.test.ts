import { GET } from './route'

let mockBasePath = '/artbot'
jest.mock('BASE_PATH', () => ({
  get basePath() {
    return mockBasePath
  }
}))

test.each(['/artbot', '/artbot-beta'])(
  'the manifest launches and loads every resource under %s',
  async (basePath) => {
    mockBasePath = basePath
    const response = GET()
    expect(response.headers.get('content-type')).toBe(
      'application/manifest+json'
    )
    const manifest = await response.json()
    expect(manifest.scope).toBe(basePath)
    expect(manifest.start_url).toBe(basePath)
    expect(manifest.display).toBe('standalone')
    const resources = [
      ...manifest.icons.map((icon: { src: string }) => icon.src),
      ...manifest.shortcuts.flatMap(
        (shortcut: { url: string; icons: { src: string }[] }) => [
          shortcut.url,
          ...shortcut.icons.map((icon) => icon.src)
        ]
      )
    ]
    expect(resources).toHaveLength(7)
    for (const resource of resources) {
      const url = new URL(resource, 'https://tinybots.net')
      expect(url.origin).toBe('https://tinybots.net')
      expect(url.pathname.startsWith(basePath + '/')).toBe(true)
    }
  }
)
