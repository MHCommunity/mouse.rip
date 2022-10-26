/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    unoptimized: false,
  },
  async redirects() {
    return [
      {
        source: '/cre',
        destination: 'https://tsitu.github.io/MH-Tools/cre.html',
        permanent: true,
      },
    ]
  },
}
