/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

const { basePath } = require('./BASE_PATH.js')

const nextConfig = {
  basePath,
  compiler: {
    // TODO: Remove me when styled-components is gone
    // https://nextjs.org/docs/architecture/nextjs-compiler#styled-components
    styledComponents: true
  },
  distDir: 'build',
  images: {
    domains: ['huggingface.co', 'raw.githubusercontent.com']
  },
  productionBrowserSourceMaps: false,
  reactStrictMode: false,
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
  swcMinify: true,
  webpack: (config) => {
    config.externals.push({
      bufferutil: 'commonjs bufferutil',
      canvas: 'commonjs canvas',
      sharp: 'commonjs sharp',
      'utf-8-validate': 'commonjs utf-8-validate'
    })
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader'
    })

    return config
  }
}

module.exports = withBundleAnalyzer(nextConfig)
