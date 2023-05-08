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
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  swcMinify: false, // Set to false for now due to issue with React-tooltip
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader'
    })

    return config
  }
}

module.exports = withBundleAnalyzer(nextConfig)
