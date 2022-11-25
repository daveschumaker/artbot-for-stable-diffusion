/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

const nextConfig = {
  basePath: '/artbot',
  distDir: 'build',
  images: {
    domains: ['raw.githubusercontent.com']
  },
  reactStrictMode: true,
  swcMinify: true
}

module.exports = withBundleAnalyzer(nextConfig)
