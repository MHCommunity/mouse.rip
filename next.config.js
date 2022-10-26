/** @type {import('next').NextConfig} */
module.exports = {
  experimental: { runtime: 'experimental-edge' },
  reactStrictMode: false,
  swcMinify: true,
  images: { unoptimized: true },
}
