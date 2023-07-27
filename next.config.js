/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

const nextConfig = {
  basePath: '/artbot',
  distDir: 'build',
  images: {
    domains: ['huggingface.co', 'raw.githubusercontent.com']
  },
  productionBrowserSourceMaps: false, // Setting to true seems to blow up our prod Node server
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/artbot',
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
