import { basePath } from 'BASE_PATH'

// Keep the existing manifest URL, including for previously installed apps.
export const dynamic = 'force-static'

export function GET() {
  return Response.json(
    {
      name: 'ArtBot',
      short_name: 'ArtBot',
      lang: 'en-GB',
      scope: basePath,
      start_url: basePath,
      display: 'standalone',
      orientation: 'portrait-primary',
      theme_color: '#222222',
      background_color: '#222222',
      icons: [
        {
          src: `${basePath}/appicons/round-192.png`,
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: `${basePath}/appicons/round-512.png`,
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: `${basePath}/appicons/mask.png`,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ],
      shortcuts: [
        {
          name: 'Create',
          url: `${basePath}/create`,
          icons: [
            {
              src: `${basePath}/shorticons/create.png`,
              sizes: '192x192',
              type: 'image/png'
            }
          ]
        },
        {
          name: 'Settings',
          url: `${basePath}/settings`,
          icons: [
            {
              src: `${basePath}/shorticons/settings.png`,
              sizes: '192x192',
              type: 'image/png'
            }
          ]
        }
      ]
    },
    { headers: { 'Content-Type': 'application/manifest+json' } }
  )
}
