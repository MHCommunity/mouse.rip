/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/cre',
        destination: 'https://tsitu.github.io/MH-Tools/cre.html',
        permanent: true,
      },
    ]
  }
}

module.exports = nextConfig
