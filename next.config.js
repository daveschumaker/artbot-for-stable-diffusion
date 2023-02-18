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
  productionBrowserSourceMaps: process.env.ANALYZE === 'true' ? true : false,
  reactStrictMode: true,
  swcMinify: false // Set to false for now due to issue with React-tooltip
}

module.exports = withBundleAnalyzer(nextConfig)
