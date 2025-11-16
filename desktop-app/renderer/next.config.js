/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
  // Disable server-side features
  trailingSlash: true,
  // Disable React StrictMode to prevent double API calls in development
  reactStrictMode: false,
}

module.exports = nextConfig
