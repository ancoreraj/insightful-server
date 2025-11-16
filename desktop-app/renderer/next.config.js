/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  // Disable server-side features
  trailingSlash: true,
  // Disable React StrictMode to prevent double API calls in development
  reactStrictMode: false,
}

module.exports = nextConfig
