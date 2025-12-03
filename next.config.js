/** @type {import('next').NextConfig} */
const nextConfig = {
  // NO usar output, dejar como servidor normal
  images: {
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig