/** @type {import('next').NextConfig} */

const { basePath } = require('./BASE_PATH.js')

const nextConfig = {
  basePath,
  compiler: {
    // TODO: Remove me when styled-components is gone
    // https://nextjs.org/docs/architecture/nextjs-compiler#styled-components
    styledComponents: true
  },
  distDir: 'build',
  productionBrowserSourceMaps: false,
  reactStrictMode: false,
  env: {
    ARTBOT_STATUS_API: process.env.ARTBOT_STATUS_API,
    // Fixed at build time. Browser code needs it too.
    BASE_PATH: basePath
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: basePath,
        basePath: false,
        permanent: false
      }
    ]
  },
  // Native modules that optional dependencies of fabric, jsdom and ws load on
  // the server. They're required at runtime instead of bundled.
  serverExternalPackages: ['bufferutil', 'canvas', 'sharp', 'utf-8-validate'],
  turbopack: {
    rules: {
      // The changelog page imports CHANGELOG.md as a string.
      '*.md': {
        loaders: ['raw-loader'],
        as: '*.js'
      }
    }
  }
}

module.exports = nextConfig
